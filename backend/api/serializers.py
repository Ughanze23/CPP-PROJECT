from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Supplier, Product, ProductCategory, PurchaseOrder, \
Inventory,Shipment,Notification,Customer,SalesOrder,Order,OrderItem,ShipmentOrder
from datetime import timedelta
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from django.db import models

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username","password"]
        extra_kwargs = {"password": {"write_only": True}}
    
    
    def create(self,validated_data):
        """Create a new User"""
        user = User.objects.create_user(**validated_data)
        return user

class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = ["id", "name", "description", "created_by", "created_at", "updated_at"]
        read_only_fields = ["created_by", "created_at", "updated_at"]

    def validate_name(self, value):
        """Check that the category name is unique, except when updating the same record."""
        category = self.instance  # This refers to the current instance being updated

        # If the name is being updated and is already taken by another category, raise an error
        if category and category.name != value and ProductCategory.objects.filter(name=value).exists():
            raise ValidationError("A category with this name already exists.")
        return value

    def create(self, validated_data):
        """Create a Product Category"""
        validated_data["created_by"] = self.context['request'].user
        return super().create(validated_data)



class ProductSerializer(serializers.ModelSerializer):
    category = ProductCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=ProductCategory.objects.all(), source='category', write_only=True
    )

    class Meta:
        model = Product
        fields = [
            "id", "name", "description", "category", "category_id",
            "price", "stock_quantity", "created_by", "created_at", "updated_at"
        ]
        read_only_fields = ["created_by", "created_at", "updated_at"]

    def validate_name(self, value):
        """Check that the product name is unique, except when updating the same record."""
        product = self.instance  # This refers to the current instance being updated

        # If the name is being updated and is already taken by another product, raise an error
        if product and product.name != value and Product.objects.filter(name=value).exists():
            raise ValidationError("A product with this name already exists.")
        return value

    def create(self, validated_data):
        """Create a Product"""
        validated_data["created_by"] = self.context['request'].user
        return super().create(validated_data)



class InventorySerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', write_only=True
    )
    batch_id = serializers.CharField(read_only=True)
    expiry_date = serializers.DateField(required=False, allow_null=True)

    class Meta:
        model = Inventory
        fields = [
            "id", "product", "product_id", "quantity", "status", "notes",
            "updated_by", "created_at", "batch_id", "expiry_date"
        ]
        read_only_fields = ["updated_by", "created_at", "batch_id"]

    def create(self, validated_data):
        """Create an Inventory record"""
        validated_data["updated_by"] = self.context['request'].user
        return super().create(validated_data)




class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ["id", "name", "contact_email", "contact_phone", "address", "created_by", "created_at", "updated_at"]
        read_only_fields = ["created_by", "created_at", "updated_at"]

    def validate_name(self, value):
        """Check that the supplier name is unique, except when updating the same record."""
        supplier = self.instance  # This refers to the current instance being updated

        # If the name is being updated and is already taken by another supplier, raise an error
        if supplier and supplier.name != value and Supplier.objects.filter(name=value).exists():
            raise ValidationError("A supplier with this name already exists.")
        return value

    def validate_contact_email(self, value):
        """Check that the supplier email is unique, except when updating the same record."""
        supplier = self.instance  # This refers to the current instance being updated

        # If the email is being updated and is already taken by another supplier, raise an error
        if supplier and supplier.contact_email != value and Supplier.objects.filter(contact_email=value).exists():
            raise ValidationError("A supplier with this email already exists.")
        return value

    def validate_contact_phone(self, value):
        """Check that the supplier phone number is unique, except when updating the same record."""
        supplier = self.instance  # This refers to the current instance being updated

        # If the phone number is being updated and is already taken by another supplier, raise an error
        if supplier and supplier.contact_phone != value and Supplier.objects.filter(contact_phone=value).exists():
            raise ValidationError("A supplier with this phone number already exists.")
        return value

    def create(self, validated_data):
        """Create a new Supplier"""
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)



class PurchaseOrderSerializer(serializers.ModelSerializer):
    """Creating a Purchase Order"""
    supplier = SupplierSerializer(read_only=True)
    supplier_id = serializers.PrimaryKeyRelatedField(
        queryset=Supplier.objects.all(), source='supplier', write_only=True
    )
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', write_only=True
    )
    batch_id = serializers.CharField(read_only=True)  # Expose batch_id as a read-only field

    class Meta:
        model = PurchaseOrder
        fields = [
            "id", "supplier", "supplier_id", "product", "product_id",
            "quantity", "order_date", "expected_delivery_date",
            "status", "created_by", "notes", "batch_id"
        ]
        read_only_fields = ["id", "order_date", "created_by", "batch_id"]

    def create(self, validated_data):
        """Create purchase order"""
        validated_data['created_by'] = self.context['request'].user
        # Create the purchase order instance
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """Update inventory once stock is received"""
        # Retrieve the new status from validated_data
        new_status = validated_data.get("status", instance.status)

        # Only create inventory if the status is being changed to 'RECEIVED'
        if new_status == "RECEIVED" and instance.status != "RECEIVED":
            # Set a default expiry period of 1 year (or customize as needed)
            default_expiry_period = 365
            expiry_date = (
                instance.expected_delivery_date + timedelta(days=default_expiry_period)
                if instance.expected_delivery_date
                else None
            )

            # Generate batch_id using the PO ID and order date if not already set
            if not instance.batch_id:
                instance.batch_id = f"PO-{instance.id}-{instance.order_date.strftime('%Y%m%d%H%M%S')}"

            # Create an inventory record for the received products
            Inventory.objects.create(
                product=instance.product,
                quantity=instance.quantity,
                status="ADD",
                notes=f"Stock received from Purchase Order {instance.id}",
                updated_by=self.context['request'].user,  # Log the user who received the stock
                expiry_date=expiry_date  # Set calculated expiry date
            )

        # Update the purchase order instance with the validated data
        return super().update(instance, validated_data)


class ShipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shipment
        fields = [
            "id", "logistics_company", "contact_person", "email", 
            "status", "delivery_zone", "created_by", "created_at", "updated_at"
        ]
        read_only_fields = ["created_by", "created_at", "updated_at"]

    def validate_logistics_company(self, value):
        """Check that the logistics company name is unique, except when updating the same record."""
        shipment = self.instance  # This refers to the current instance being updated

        # If the logistics company name is being updated and is already taken by another shipment, raise an error
        if shipment and shipment.logistics_company != value and Shipment.objects.filter(logistics_company=value).exists():
            raise ValidationError("A logistics company with this name already exists.")
        return value

    def validate_email(self, value):
        """Check that the email is unique, except when updating the same record."""
        shipment = self.instance  # This refers to the current instance being updated

        # If the email is being updated and is already taken by another shipment, raise an error
        if shipment and shipment.email != value and Shipment.objects.filter(email=value).exists():
            raise ValidationError("A shipment with this email already exists.")
        return value

    def create(self, validated_data):
        """Create a new Shipment"""
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class NotificationSerializer(serializers.ModelSerializer):
    batch_id = serializers.CharField(source='batch_id.batch_id', read_only=True)  # Read-only
    product_name = serializers.CharField(source='product_name.name', read_only=True)  # Read-only

    class Meta:
        model = Notification
        fields = ['id', 'batch_id', 'type', 'product_name', 'status', 'created_at', 'updated_at', 'notes']
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_status(self, value):
        if value not in ["OPEN", "IN_PROGRESS", "CLOSED"]:
            raise serializers.ValidationError("Invalid status. Must be one of: OPEN, IN_PROGRESS, CLOSED.")
        return value


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            "id", "name", "email", "phone", "eir_code", "zone",
            "created_by", "created_at", "updated_at"
        ]
        read_only_fields = ["created_by", "created_at", "updated_at"]

    def validate_email(self, value):
        """Check that email is unique"""
        customer = self.instance
        if customer and customer.email != value and Customer.objects.filter(email=value).exists():
            raise ValidationError("A customer with this email already exists.")
        return value

    def validate_eir_code(self, value):
        """Validate eir_code format"""
        if len(value) != 7:
            raise ValidationError("Invalid eir_code format. Must be 7 characters.")
        return value

    def create(self, validated_data):
        validated_data["created_by"] = self.context['request'].user
        return super().create(validated_data)

class OrderSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(read_only=True)
    customer_id = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(), source='customer', write_only=True
    )
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)  # Make it read-only

    class Meta:
        model = Order
        fields = [
            "id", "customer", "customer_id", "order_date", "status",
            "total_amount", "created_by", "notes"
        ]
        read_only_fields = ["created_by", "order_date", "total_amount"]

    def create(self, validated_data):
        validated_data["created_by"] = self.context['request'].user
        validated_data["total_amount"] = 0  # Initialize to 0, will be updated when OrderItems are added
        return super().create(validated_data)

class OrderItemSerializer(serializers.ModelSerializer):
    order = OrderSerializer(read_only=True)
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', write_only=True
    )

    class Meta:
        model = OrderItem
        fields = [
            "id", "order", "product", "product_id",
            "quantity", "unit_price", "created_at"
        ]
        read_only_fields = ["created_at", "unit_price"]

    def create(self, validated_data):
        # Set unit_price from product's current price
        validated_data['unit_price'] = validated_data['product'].price
        order_item = super().create(validated_data)

        # Update order total
        order = order_item.order
        order.total_amount = OrderItem.objects.filter(order=order).aggregate(
            total=models.Sum(models.F('quantity') * models.F('unit_price'))
        )['total'] or 0
        order.save()

        return order_item

class OrderItemSerializer(serializers.ModelSerializer):
    order = OrderSerializer(read_only=True)
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', write_only=True
    )

    class Meta:
        model = OrderItem
        fields = [
            "id", "order", "product", "product_id",
            "quantity", "unit_price", "created_at"
        ]
        read_only_fields = ["created_at", "unit_price"]  # Make unit_price read-only

    def validate(self, data):
        """Validate if there's enough stock"""
        product = data['product']
        quantity = data['quantity']
        
        # Get available stock
        available_stock = Inventory.objects.filter(
            product=product,
            status__in=["ADD", "RETURN"]
        ).aggregate(
            total=models.Sum('quantity')
        )['total'] or 0

        if quantity > available_stock:
            raise ValidationError(f"Insufficient stock. Only {available_stock} units available.")
        
        return data

    def create(self, validated_data):
        """Set unit_price from product's current price during creation"""
        validated_data['unit_price'] = validated_data['product'].price
        return super().create(validated_data)

class SalesOrderSerializer(serializers.ModelSerializer):
    order = OrderSerializer(read_only=True)
    order_id = serializers.PrimaryKeyRelatedField(
        queryset=Order.objects.all(), source='order', write_only=True
    )
    total_amount = serializers.DecimalField(
        source='order.total_amount',
        read_only=True,
        max_digits=10,
        decimal_places=2
    )

    class Meta:
        model = SalesOrder
        fields = [
            "id", "order", "order_id", "payment_terms", 
            "status", "total_amount", "created_by", 
            "created_at", "updated_at"
        ]
        read_only_fields = ["created_by", "created_at", "updated_at", "total_amount"]

    def validate_order(self, value):
        """Ensure order has items and is not already processed"""
        if not value.items.exists():
            raise ValidationError("Cannot create sales order for an order without items")
        if hasattr(value, 'sales_order'):
            raise ValidationError("Sales order already exists for this order")
        return value

    def create(self, validated_data):
        validated_data["created_by"] = self.context['request'].user
        return super().create(validated_data)

class ShipmentOrderSerializer(serializers.ModelSerializer):
    order = OrderSerializer(read_only=True)
    shipment_provider = ShipmentSerializer(read_only=True)
    shipment_provider_id = serializers.PrimaryKeyRelatedField(
        queryset=Shipment.objects.all(), source='shipment_provider', write_only=True
    )

    class Meta:
        model = ShipmentOrder
        fields = [
            "id", "order", "shipment_provider", "shipment_provider_id",
            "shipping_address", "status", "created_at", "updated_at"
        ]
        read_only_fields = ["created_at", "updated_at"]

    def validate_shipping_address(self, value):
        if len(value) != 7:
            raise ValidationError("Invalid eir_code format. Must be 7 characters.")
        return value

    def create(self, validated_data):
        order = self.context['order']
        validated_data['order'] = order
        validated_data['shipping_address'] = order.customer.eir_code
        return super().create(validated_data)