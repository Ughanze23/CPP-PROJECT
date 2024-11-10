from django.urls import path,include
from .views import *
from rest_framework.routers import DefaultRouter

router = DefaultRouter()

# Register viewsets with the router
router.register(r'categories', ProductCategoryViewSet, basename='product-category')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'inventory', InventoryViewSet, basename='inventory')
router.register(r'purchase-orders', PurchaseOrderViewSet, basename='purchase-order')
router.register(r'suppliers', SupplierViewSet, basename='supplier')
router.register(r'shipping', ShipmentViewSet, basename='shipment')


# Define urlpatterns
urlpatterns = [
    path('', include(router.urls)),  
]