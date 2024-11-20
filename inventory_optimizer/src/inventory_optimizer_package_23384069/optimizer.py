import django
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum

class InventoryOptimizer:
    """A library for optimizing inventory based on weekly sales average."""
    
    def __init__(self, min_stock_threshold=10):
        self.min_stock_threshold = min_stock_threshold
        self.period = 7

    def calculate_weekly_average(self, product_id, inventory_model, start_date=None, end_date=None):
        """
        Calculate 7-day average usage for a product
        
        Args:
            product_id: ID of the product to analyze
            inventory_model: Django model class for inventory
            start_date: Optional start date for analysis
            end_date: Optional end date for analysis
            
        Returns:
            float: Daily average sales
        """
        end_date = timezone.now()
        start_date = end_date - timedelta(days=self.period)

        sales = abs(inventory_model.objects.filter(
            product_id=product_id,
            status="REMOVE",
            created_at__range=(start_date, end_date)
        ).aggregate(total_usage=Sum('quantity'))['total_usage'] or 0)

        return sales / self.period

    def generate_recommendations(self, product_id, sales_data, current_stock):
        daily_average = self.calculate_weekly_average(product_id, sales_data)
        reorder_point = daily_average * 3
        
        return {
            'product_id': product_id,
            'current_stock': current_stock,
            'daily_average_usage': daily_average,
            'reorder_point': reorder_point,
            'recommended_order': daily_average * 7,
            'needs_reorder': current_stock <= reorder_point
        }
    
