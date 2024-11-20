# Inventory Optimizer

A Django library for optimizing inventory levels based on weekly sales patterns.

## Features
- 7-day sales analysis
- Daily average usage calculation
- Reorder point recommendations
- Automated stock alerts
- Simple integration with Django models

## Installation
```bash
pip install inventory-optimizer-package-23384069
```

## Quick Start
```python
from inventory_optimizer import InventoryOptimizer

# Initialize optimizer
optimizer = InventoryOptimizer(min_stock_threshold=10)

# Generate recommendations
recommendations = optimizer.generate_recommendations(
    product_id=1,
    product_model=Product,
    inventory_model=Inventory,
    notification_model=Notification
)
```

## Requirements
- Python >= 3.6
- Django >= 3.2

## Configuration
The optimizer uses:
- 7-day analysis period
- 3-day stock threshold for reorder points
- Minimum stock threshold (configurable)

## API Reference

### InventoryOptimizer(min_stock_threshold=10)
Main class for inventory optimization.

### calculate_weekly_average(product_id, inventory_model, start_date=None, end_date=None)
Returns daily average sales based on 7-day history.

### generate_recommendations(product_id, product_model, inventory_model, notification_model)
Returns dictionary with:
- current_stock
- daily_average_usage
- reorder_point
- recommended_order
- needs_reorder

## License
MIT

