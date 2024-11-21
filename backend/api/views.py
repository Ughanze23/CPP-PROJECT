from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import generics,viewsets
from django.contrib.auth.models import User
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Supplier, Product, ProductCategory, Inventory, PurchaseOrder,Shipment,Notification\
,Customer, Order, OrderItem, SalesOrder, ShipmentOrder
from .serializers import (
    SupplierSerializer, ProductSerializer, ProductCategorySerializer,
    InventorySerializer, PurchaseOrderSerializer,ShipmentSerializer,NotificationSerializer,
     CustomerSerializer, OrderSerializer, OrderItemSerializer,
   SalesOrderSerializer, ShipmentOrderSerializer
)
import logging


# Create your views here.
def home(requests):
    return HttpResponse("this is the homepage")


#create user view
class CreateUserView(generics.CreateAPIView):
    """A viewset for creating new users"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class ProductCategoryViewSet(viewsets.ModelViewSet):
    """A viewset for viewing and editing product category instances."""
    queryset = ProductCategory.objects.all()
    serializer_class = ProductCategorySerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        """Automatically assign the creator of the category."""
        serializer.save(created_by=self.request.user)

class ProductViewSet(viewsets.ModelViewSet):
    """A viewset for viewing and editing products"""
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class InventoryViewSet(viewsets.ModelViewSet):
    """A viewset for viewing and editing inventory data"""
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(updated_by=self.request.user)

class SupplierViewSet(viewsets.ModelViewSet):
    """A viewset for viewing and editing supplier """
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    """A viewset for viewing and editing purchase order instances."""
    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class ShipmentViewSet(viewsets.ModelViewSet):
    """A viewset for viewing, creating, updating, and deleting shipment instances."""
    queryset = Shipment.objects.all()
    serializer_class = ShipmentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        """Override to set the user who created the shipment."""
        serializer.save(created_by=self.request.user)

class NotificationViewSet(viewsets.ModelViewSet):

    """A viewset for viewing and editing Notification instances."""
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        """Override to set additional logic during notification update."""
        serializer.save()


class CustomerViewSet(viewsets.ModelViewSet):
   """A viewset for managing customer data"""
   queryset = Customer.objects.all()
   serializer_class = CustomerSerializer
   permission_classes = [IsAuthenticated]

   def perform_create(self, serializer):
       serializer.save(created_by=self.request.user)

class OrderViewSet(viewsets.ModelViewSet):
   """A viewset for managing orders"""
   queryset = Order.objects.all()
   serializer_class = OrderSerializer
   permission_classes = [IsAuthenticated]

   def perform_create(self, serializer):
       serializer.save(created_by=self.request.user)

class OrderItemViewSet(viewsets.ModelViewSet):
   """A viewset for managing order items"""
   queryset = OrderItem.objects.all()
   serializer_class = OrderItemSerializer
   permission_classes = [IsAuthenticated]

   def get_queryset(self):
       """Optionally filter by order"""
       queryset = OrderItem.objects.all()
       order_id = self.request.query_params.get('order_id', None)
       if order_id is not None:
           queryset = queryset.filter(order_id=order_id)
       return queryset

class SalesOrderViewSet(viewsets.ModelViewSet):
   """A viewset for managing sales orders"""
   queryset = SalesOrder.objects.all()
   serializer_class = SalesOrderSerializer
   permission_classes = [IsAuthenticated]

   def perform_create(self, serializer):
       serializer.save(created_by=self.request.user)

class ShipmentOrderViewSet(viewsets.ModelViewSet):
   """A viewset for managing shipment orders"""
   queryset = ShipmentOrder.objects.all()
   serializer_class = ShipmentOrderSerializer
   permission_classes = [IsAuthenticated]

   def get_serializer_context(self):
       """Add order to context if creating new shipment order"""
       context = super().get_serializer_context()
       if self.action == 'create':
           order_id = self.request.data.get('order_id')
           if order_id:
               try:
                   order = Order.objects.get(id=order_id)
                   context['order'] = order
               except Order.DoesNotExist:
                   raise ValidationError("Invalid order_id provided")
       return context