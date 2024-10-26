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

    class Meta:
        model = Inventory
        fields = [
            "id", "product", "product_id", "quantity", "change_type", "notes", 
            "updated_by", "created_at"
        ]
        read_only_fields = ["updated_by", "created_at"]

    def create(self, validated_data):
        """Update Inventory"""
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

    class Meta:
        model = PurchaseOrder
        fields = [
            "id", "supplier", "supplier_id", "product", "product_id", 
            "quantity", "order_date", "expected_delivery_date", 
            "status", "created_by", "notes"
        ]
        read_only_fields = ["id", "order_date", "created_by"]

    def create(self, validated_data):
        """Create purchase order"""
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """Update inventory once stock is received"""
        status = validated_data.get("status", instance.status)
        if status == "RECEIVED" and instance.status != "RECEIVED":
            Inventory.objects.create(
                product=instance.product,
                quantity=instance.quantity,
                change_type="ADD",
                notes=f"Stock received from Purchase Order {instance.id}",
                updated_by=instance.created_by,
            )
        return super().update(instance, validated_data)