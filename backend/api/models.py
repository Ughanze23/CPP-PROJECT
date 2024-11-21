from django.db import models
from django.contrib.auth.models import User
from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from .inventory_stock_sqs import InventoryOptimizationQueue
from django.db import transaction
import json
import boto3

# Create your models here.
class ProductCategory(models.Model):
    """Product Category Table"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="categories_created_by")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    """Products Table"""
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    category = models.ForeignKey(ProductCategory, on_delete=models.SET_NULL, null=True, related_name="products")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_quantity = models.PositiveIntegerField()
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="products_created_by")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Check if the product is being created (not updated)
        is_new = self.pk is None
        super().save(*args, **kwargs)

        if is_new:
            # Create an initial inventory record with the stock_quantity provided
            Inventory.objects.create(
                product=self,
                quantity=self.stock_quantity,
                status="ADD",
                notes="Initial stock on product creation",
                updated_by=self.created_by,
                expiry_date=timezone.now() + timedelta(days=180),  # Default expiry set to 6 months from now
            )


class Inventory(models.Model):
    """Inventory Table"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="product_inv")
    quantity = models.IntegerField() 
    status = models.CharField(
        max_length=50,
        choices=[("ADD", "Addition"), ("REMOVE", "Removal"), ("RETURN", "Return"), ("ADJUST", "Adjustment")]
    )
    notes = models.TextField(blank=True, null=True)  # Optional field for extra details
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="inventory_updated_by")
    created_at = models.DateTimeField(auto_now_add=True)
    expiry_date = models.DateField(null=True, blank=True)
    batch_id = models.CharField(max_length=100, editable=False, unique=True, null=True) 

    class Meta:
        # Ensure unique combination of product, created_at, and expiry_date for batch tracking
        unique_together = ("product", "created_at", "expiry_date")

    def save(self, *args, **kwargs):
        """Override the save method to automatically update the stock quantity of the related product and set batch_id."""
        # Save the instance first to populate created_at
        super().save(*args, **kwargs)

        # Now, generate batch_id if it wasn't set before
        if not self.batch_id:
            self.batch_id = f"{self.product.id}-{self.created_at.strftime('%Y%m%d%H%M%S')}"
            # Save again to store the batch_id in the database
            super().save(update_fields=['batch_id'])

        # Update the product's stock quantity based on this inventory record
        if self.status in ["ADD", "RETURN"]:
            self.product.stock_quantity += self.quantity
        elif self.status in ["REMOVE", "ADJUST"]:
            self.product.stock_quantity -= abs(self.quantity)

        self.product.save()

        # Add queue call here for REMOVE operations
        if self.status == "REMOVE":
            queue = InventoryOptimizationQueue(settings.AWS_INVENTORY_SQS_QUEUE_URL)
            queue.queue_product_id(self.product.id)

    def __str__(self):
        return f"{self.product.name} - {self.status} ({self.quantity}) - Expiry: {self.expiry_date}"


class Supplier(models.Model):
    """Supplier Table"""
    name = models.CharField(max_length=200)
    contact_email = models.EmailField(blank=True, null=True)
    contact_phone = models.CharField(max_length=12, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="supplier_created_by")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class PurchaseOrder(models.Model):
    """Purchase Order Table"""
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("RECEIVED", "Received"),
        ("CANCELED", "Canceled")
    ]

    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name="purchase_orders_supplier")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="purchase_orders_product")
    quantity = models.PositiveIntegerField()
    order_date = models.DateTimeField(auto_now_add=True)
    expected_delivery_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="purchase_orders_created_by")
    notes = models.TextField(blank=True, null=True)
    batch_id = models.CharField(max_length=100, editable=False, unique=True, blank=True) 

    def __str__(self):
        return f"PO-{self.id} ({self.supplier.name} - {self.product.name})"

    def save(self, *args, **kwargs):
        """Handle inventory when an order is marked as 'Received'."""
        super().save(*args, **kwargs)  

        # Now, set the batch_id if it wasn't set before
        if not self.batch_id:
            self.batch_id = f"PO-{self.id}-{self.order_date.strftime('%Y%m%d%H%M%S')}"
            super().save(update_fields=['batch_id'])  

        if self.status == "RECEIVED":
            # Determine the expiry date for the inventory batch 
            default_expiry_period = 180  
            expiry_date = self.expected_delivery_date + timedelta(days=default_expiry_period) if self.expected_delivery_date else None
            
            # Create an inventory record to add the received stock
            Inventory.objects.create(
                product=self.product,
                quantity=self.quantity,
                status="ADD",
                notes=f"Stock received from Purchase Order {self.id}",
                updated_by=self.created_by,
                expiry_date=expiry_date, 
            )


class Shipment(models.Model):
    """Model for managing shipments."""
    STATUS_CHOICES = [
        ("ACTIVE", "Active"),
        ("INACTIVE", "Inactive"),
    ]

    logistics_company = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=255)
    email = models.EmailField(max_length=254)
    status = models.CharField(max_length=8, choices=STATUS_CHOICES, default="ACTIVE")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    delivery_zone = models.JSONField(default=list) 
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='shipments_created')

    def __str__(self):
        return f"{self.logistics_company} - {self.contact_person} ({self.status})"

class Notification(models.Model):
    STATUS_CHOICES = [
        ("OPEN", "Open"),
        ("IN_PROGRESS", "In Progress"),
        ("CLOSED", "Closed"),
    ]

    batch_id = models.ForeignKey(Inventory, on_delete=models.CASCADE, related_name='notifications', null=True)
    type = models.CharField(max_length=50, choices=[("STOCK_ISSUE", "Stock Issue"), ("STOCK_EXPIRY", "Stock Expiry")])
    product_name = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='notifications')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="OPEN")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Notification for {self.product_name.name} - {self.type}"

class Customer(models.Model):
    """Customer Table"""
    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=12, blank=True, null=True)
    eir_code = models.CharField(max_length=7)  # Irish postal code
    zone = models.IntegerField(
        choices=[(i, str(i)) for i in range(1, 25)],  # 1-24
        help_text="Delivery zone (1-24)"
    )
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="customers_created_by")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']

class Order(models.Model):
    """Orders Table"""
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("PROCESSING", "Processing"),
        ("SHIPPED", "Shipped"),
        ("DELIVERED", "Delivered"),
        ("CANCELLED", "Cancelled")
    ]
    
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='orders')
    order_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="orders_created_by")
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Order #{self.id} - {self.customer.name}"

class OrderItem(models.Model):
    """Order Items Table"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='order_items')
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.order.id} - {self.product.name} ({self.quantity})"

    def save(self, *args, **kwargs):
        with transaction.atomic():
            super().save(*args, **kwargs)
            
            remaining_quantity = self.quantity
            batches = Inventory.objects.filter(
                product=self.product,
                status__in=["ADD", "RETURN"]
            ).order_by('expiry_date')

            for batch in batches:
                if remaining_quantity <= 0:
                    break

                if batch.quantity > 0:
                    quantity_from_batch = min(batch.quantity, remaining_quantity)
                    batch.quantity -= quantity_from_batch
                    batch.save()
                    remaining_quantity -= quantity_from_batch

            if remaining_quantity > 0:
                raise ValueError(f"Insufficient stock for product {self.product.name}")

class SalesOrder(models.Model):
    """Sales Order Table"""
    STATUS_CHOICES = [
        ("PAID", "Paid"),
        ("CANCELLED", "Cancelled")  # For returned orders
    ]
    
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='sales_order')
    payment_terms = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PAID")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="sales_orders_created_by")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Sales Order - {self.order.customer.name} ({self.status})"

class ShipmentOrder(models.Model):
    """Shipment Order Table"""
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("DELIVERED", "Delivered"),
        ("CANCELLED", "Cancelled")
    ]
    
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='shipment')
    shipment_provider = models.ForeignKey(Shipment, on_delete=models.SET_NULL, null=True, related_name='shipment_orders')
    shipping_address = models.CharField(max_length=7)  # eir_code
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Shipment for Order #{self.order.id} - {self.order.customer.name}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        # Send message to SQS
        if self.status == "PENDING":
            sqs = boto3.client(
                'sqs',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_REGION
            )

            message = {
                'order_id': self.order.id,
                'shipping_zone': self.order.customer.zone,
                'eir_code': self.shipping_address
            }

            try:
                sqs.send_message(
                    QueueUrl=settings.AWS_SHIPMENT_SQS_QUEUE_URL,
                    MessageBody=json.dumps(message)
                )
            except Exception as e:
                print(f"Error sending to SQS: {e}")