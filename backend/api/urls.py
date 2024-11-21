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
router.register(r'notifications',NotificationViewSet , basename='notification')
router.register(r'shipment-orders', ShipmentOrderViewSet, basename='shipment-order')
router.register(r'customers', CustomerViewSet, basename='customer')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'order-items', OrderItemViewSet, basename='order-item')
router.register(r'sales-orders', SalesOrderViewSet, basename='sale-order')


# Define urlpatterns
urlpatterns = [
    path('', include(router.urls)),  
]