class InventoryOptimizer:
    def __init__(self, min_stock_threshold=10):
        self.min_stock_threshold = min_stock_threshold
        self.period = 7

    def calculate_weekly_average(self, product_id, order_item_model):
        from datetime import datetime, timedelta

        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=self.period)

        # Get sales quantity from orders in list
        sales = sum(item[0] for item in order_item_model)
        daily_average = abs(sales) / self.period
        return daily_average

    def generate_recommendations(self, product_id, order_item_model, current_stock):
        daily_average = self.calculate_weekly_average(
            product_id, 
            order_item_model
        )
        
        reorder_point = daily_average * 3
        return {
            'product_id': product_id,
            'current_stock': current_stock,
            'daily_average_usage': daily_average,
            'reorder_point': reorder_point,
            'recommended_order': daily_average * 7,
            'needs_reorder': current_stock <= reorder_point
        }