import React, { useState, useEffect, useMemo } from 'react';
import api from "../api";
import { 
  Box, 
  Button, 
  Snackbar, 
  Alert, 
  Typography, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel, 
  Checkbox, 
  ListItemText } from '@mui/material'; 
import { useForm, Controller } from 'react-hook-form';
import Grid from '@mui/material/Grid2';
import MyTextField from './Forms/MyTextField';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';

const Inventory = () => {

  const [inventory, setInventory] = useState([]);  
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');


  const getData = async () => {
    try {
      const res = await api.get('/api/inventory/');
      setInventory(res.data);
    } catch (error) {
      console.error('Failed to fetch Inventory data:', error);
      setSnackbarMessage('Error loading Inventory data');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'batch_id',  
        header: 'ID',
        size: 150,
      },
      {
        accessorKey: 'created_at',  
        header: 'Created At',
        size: 150,
      },
    
    
      {
        accessorKey: 'status',
        header: 'Status',
        size: 150,
      },
      {
        accessorKey: 'quantity',
        header: 'Quantity',
        size: 200,
      },
      {
        accessorKey: 'expiry_date',
        header: 'Expiry Date',
        size: 200,
      },
      {
        accessorKey: 'notes',
        header: 'Notes',
        size: 200,
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: inventory,  
    state: { isLoading: loading },
  });

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <div><Box sx={{ mt: 4 }}>
    <Typography variant="h6" sx={{ marginLeft: '20px', mb: 2 }}>
      Inventory
    </Typography>
    <MaterialReactTable table={table} />
  </Box>

  <Snackbar 
    open={snackbarOpen} 
    autoHideDuration={5000} 
    onClose={handleCloseSnackbar} 
    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
  >
    <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
      {snackbarMessage}
    </Alert>
  </Snackbar>
</div>
  )
}

export default Inventory