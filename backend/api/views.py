from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import generics,viewsets
from django.contrib.auth.models import User
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Supplier, Product, ProductCategory, Inventory, PurchaseOrder
from .serializers import (
    SupplierSerializer, ProductSerializer, ProductCategorySerializer,
    InventorySerializer, PurchaseOrderSerializer
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
        #validate data entered is correct
        if serializer.is_valid():
            serializer.save(created_by=self.request.user)
        else:
            logging.error(serializer.error)

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