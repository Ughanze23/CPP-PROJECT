import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Grid, 
  Typography, 
  CircularProgress 
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  LocalShipping as ShippingIcon,
  Notifications as NotificationsIcon,
  ShoppingCart as ProductsIcon,
  LocalShipping as ShipmentOrderIcon
} from '@mui/icons-material';
import api from "../api";

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography color="textSecondary" gutterBottom variant="h6">
            {title}
          </Typography>
          <Typography color="textPrimary" variant="h4">
            {value}
          </Typography>
        </Box>
        <Box sx={{ 
          backgroundColor: `${color}20`, 
          borderRadius: '50%', 
          padding: 1,
          display: 'flex',
          alignItems: 'center'
        }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Home = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    lowStock: 0,
    pendingShipments: 0,
    activeNotifications: 0,
    totalInventoryValue: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      // Fetch products count
      const products = await api.get('/api/products/');
      const totalProducts = products.data.length;

      // Fetch categories count
      const categories = await api.get('/api/categories/');
      const totalCategories = categories.data.length;

      // Fetch inventory with low stock
      const inventory = await api.get('/api/inventory/');
      const lowStock = inventory.data.filter(item => item.quantity <= 10).length;

      // Calculate total inventory value
      const totalInventoryValue = inventory.data.reduce((acc, item) => {
        return acc + (item.quantity * item.product.price);
      }, 0);

      // Fetch pending shipments
      const shipments = await api.get('/api/shipment-orders/');
      const pendingShipments = shipments.data.filter(
        shipment => shipment.status === 'PENDING'
      ).length;

      // Fetch active notifications
      const notifications = await api.get('/api/notifications/');
      const activeNotifications = notifications.data.filter(
        notification => notification.status === 'OPEN'
      ).length;

      setStats({
        totalProducts,
        totalCategories,
        lowStock,
        pendingShipments,
        activeNotifications,
        totalInventoryValue
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            icon={<ProductsIcon sx={{ color: '#1e88e5' }} />}
            color="#1e88e5"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Product Categories"
            value={stats.totalCategories}
            icon={<CategoryIcon sx={{ color: '#43a047' }} />}
            color="#43a047"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Low Stock Items"
            value={stats.lowStock}
            icon={<InventoryIcon sx={{ color: '#e53935' }} />}
            color="#e53935"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Pending Shipments"
            value={stats.pendingShipments}
            icon={<ShippingIcon sx={{ color: '#fb8c00' }} />}
            color="#fb8c00"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Active Notifications"
            value={stats.activeNotifications}
            icon={<NotificationsIcon sx={{ color: '#8e24aa' }} />}
            color="#8e24aa"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Inventory Value"
            value={`€${stats.totalInventoryValue.toFixed(2)}`}
            icon={<ShipmentOrderIcon sx={{ color: '#3949ab' }} />}
            color="#3949ab"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home;