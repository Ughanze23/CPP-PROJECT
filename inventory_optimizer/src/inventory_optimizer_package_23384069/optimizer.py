class InventoryOptimizer:
    def __init__(self, min_stock_threshold=10):
        self.min_stock_threshold = min_stock_threshold
        self.period = 7

    def calculate_weekly_average(self, product_id, delivered_quantities):
        """
        Calculate 7-day average sales from delivered orders
        delivered_quantities: List of tuples containing quantities from delivered orders
        """
        total_sales = sum(quantity[0] for quantity in delivered_quantities)
        daily_average = total_sales / self.period if total_sales > 0 else 0
        return daily_average

    def generate_recommendations(self, product_id, delivered_quantities, current_stock):
        daily_average = self.calculate_weekly_average(
            product_id, 
            delivered_quantities
        )
        
        # If daily_average is 0 but stock is below threshold, set minimum values
        if daily_average == 0 and current_stock <= self.min_stock_threshold:
            reorder_point = self.min_stock_threshold
            recommended_order = self.min_stock_threshold * 2  
        else:
            reorder_point = max(daily_average * 3, self.min_stock_threshold)
            recommended_order = max(daily_average * 7, self.min_stock_threshold * 2)

        return {
            'product_id': product_id,
            'current_stock': current_stock,
            'daily_average_usage': daily_average,
            'reorder_point': reorder_point,
            'recommended_order': recommended_order,
            'needs_reorder': current_stock <= reorder_point
        }