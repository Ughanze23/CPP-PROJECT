from django.contrib import admin
from .models import *

# Register your models here.
admin.site.register(ProductCategory)
admin.site.register(Product)
admin.site.register(Supplier)
admin.site.register(Inventory)
admin.site.register(PurchaseOrder)
admin.site.register(Shipment)
admin.site.register(Notification)