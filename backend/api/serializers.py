from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Supplier, Product, ProductCategory, PurchaseOrder, Inventory


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