from django.db import models
from django.contrib.auth.models import User

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
    category = models.ForeignKey(ProductCategory, on_delete=models.CASCADE, related_name="products")
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
                change_type="ADD",
                notes="Initial stock on product creation",
                updated_by=self.created_by,
            )

class Inventory(models.Model):
    """Inventory Table"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="product_inv")
    quantity = models.IntegerField()  # Positive for additions, negative for removals
    change_type = models.CharField(
        max_length=50,
        choices=[("ADD", "Addition"), ("REMOVE", "Removal"), ("RETURN", "Return"), ("ADJUST", "Adjustment")]
    )
    notes = models.TextField(blank=True, null=True)  # Optional field for extra details
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="inventory_updated_by")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.name} - {self.change_type} ({self.quantity})"

    def save(self, *args, **kwargs):
        """Override the save method to automatically update the stock quantity of the related product."""
        super().save(*args, **kwargs)
        # Update the product's stock quantity based on this inventory record
        if self.change_type in ["ADD", "RETURN"]:
            self.product.stock_quantity += self.quantity
        elif self.change_type in ["REMOVE", "ADJUST"]:
            self.product.stock_quantity -= abs(self.quantity)  # Ensure decrement for REMOVE or ADJUST
        self.product.save()
    
class Supplier(models.Model):
    """Supplier Table"""
    name = models.CharField(max_length=200)
    contact_email = models.EmailField(blank=True, null=True)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
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
        ("ORDERED", "Ordered"),
        ("RECEIVED", "Received"),
        ("CANCELED", "Canceled")
    ]

    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name="purchase_orders_supplier")
    product = models.ForeignKey("Product", on_delete=models.CASCADE, related_name="purchase_orders_product")
    quantity = models.PositiveIntegerField()
    order_date = models.DateTimeField(auto_now_add=True)
    expected_delivery_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="purchase_orders_created_by")
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"PO-{self.id} ({self.supplier.name} - {self.product.name})"

    def save(self, *args, **kwargs):
        """ Handle inventory when an order is marked as 'Received'"""
        super().save(*args, **kwargs)
        if self.status == "RECEIVED":
            # Update the product's stock quantity
            Inventory.objects.create(
                product=self.product,
                quantity=self.quantity,
                change_type="ADD",
                notes=f"Stock received from Purchase Order {self.id}",
                updated_by=self.created_by,
            )
