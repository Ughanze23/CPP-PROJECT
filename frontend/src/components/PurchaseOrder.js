import { useState, useEffect, useMemo } from 'react';
import api from "../api";
import {MenuItem, Box, Button, Snackbar, Alert, TextField, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import MyMultiLineField from './Forms/MyMultilineField';
import MyDatePickerField from './Forms/MyDatePickerField';
import dayjs from 'dayjs';
import { MaterialReactTable } from 'material-react-table';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import React from 'react';

const PurchaseOrder = () => {
  const defaultValues = {
    product: '',
    supplier: '',
    notes: '',
    expected_delivery_date: '',
    quantity: 0
  };

  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [deletePOId, setDeletePOId] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [editStatusModalOpen, setEditStatusModalOpen] = useState(false);
  const [currentPOId, setCurrentPOId] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('');

  const { handleSubmit, control, reset ,getValues} = useForm({ defaultValues });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, suppliersResponse, purchaseOrdersResponse] = await Promise.all([
          api.get('/api/products/'),
          api.get('/api/suppliers/'),
          api.get('/api/purchase-orders/')
        ]);
        setProducts(productsResponse.data);
        setSuppliers(suppliersResponse.data);
        setPurchaseOrders(purchaseOrdersResponse.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setSnackbarMessage('Error loading data. Please refresh the page.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns = useMemo(() => [
    { accessorKey: 'id', header: 'PO #', size: 100 },
    { accessorKey: 'product.name', header: 'Product', size: 200 },
    { accessorKey: 'supplier.name', header: 'Supplier', size: 200 },
    { accessorKey: 'quantity', header: 'Quantity', size: 120 },
    {
      accessorKey: 'expected_delivery_date',
      header: 'Expected Delivery',
      size: 150,
      Cell: ({ row }) => dayjs(row.original.expected_delivery_date).format('YYYY-MM-DD'),
    },
    { accessorKey: 'notes', header: 'Notes', size: 200 },
    { accessorKey: 'status', header: 'Status', size: 120 },
  ], []);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // submit form for creating new purchase orders
  const onSubmit = async (data) => {
    try {
      const expDate = dayjs(data.expected_delivery_date["$d"]).format("YYYY-MM-DD");

      await api.post("/api/purchase-orders/", {
        product_id: parseInt(data.product),
        supplier_id: parseInt(data.supplier),
        notes: data.notes,
        expected_delivery_date: expDate,
        quantity: parseInt(data.quantity)
      });

      const response = await api.get('/api/purchase-orders/');
      setPurchaseOrders(response.data);
      setSnackbarMessage("Purchase order created successfully!");
      setSnackbarSeverity("success");
      reset();
    } catch (error) {
      console.error("Failed to create purchase order:", error);
      setSnackbarMessage("Error creating purchase order. Please try again.");
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleDelete = async () => {
    if (!deletePOId) {
      console.error('No #PO ID to delete');
      return;
    }
    try {
      await api.delete(`/api/purchase-orders/${deletePOId}/`);
      setSnackbarMessage('#PO deleted successfully!');
      setSnackbarSeverity('success');
      const response = await api.get('/api/purchase-orders/');
      setPurchaseOrders(response.data);
    } catch (error) {
      console.error('Failed to delete #PO:', error);
      setSnackbarMessage('Error deleting #PO');
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
      setConfirmDeleteOpen(false);
      setDeletePOId(null);
    }
  };

  const handleEditStatusClick = (id, currentStatus) => {
    setCurrentPOId(id);
    setCurrentStatus(currentStatus);
    setEditStatusModalOpen(true);
  };

  const handleStatusUpdate = async () => {
    try {
      // Retrieve the new_status value from the form
      const { new_status } = getValues();
  
      if (!new_status) {
        throw new Error("New status is not selected");
      }
  
      // Fetch the full details of the current purchase order
      const currentPO = purchaseOrders.find((po) => po.id === currentPOId);
      if (!currentPO) {
        throw new Error("Purchase order not found");
      }
  
      
      const updatedPO = {
        product_id: currentPO.product.id,
        supplier_id: currentPO.supplier.id, 
        quantity: currentPO.quantity,
        status: new_status, 
      };
  
      // Send the PUT request
      await api.put(`/api/purchase-orders/${currentPOId}/`, updatedPO);
  
      // Fetch the updated purchase orders
      const response = await api.get('/api/purchase-orders/');
      setPurchaseOrders(response.data);
  
      setSnackbarMessage("Status updated successfully!");
      setSnackbarSeverity("success");
      setEditStatusModalOpen(false);
    } catch (error) {
      console.error("Failed to update status:", error);
      setSnackbarMessage("Error updating status. Please try again.");
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
    }
  };
  
  
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '70%', marginBottom: '10px' }}>
          <Typography variant="h6" sx={{ marginLeft: '20px' }}>Create Purchase Order</Typography>
        </Box>

        <Box sx={{ display: 'flex', width: '70%', boxShadow: 3, padding: 3, flexDirection: 'column', gap: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Controller
              name="product"
              control={control}
              render={({ field }) => (
                <TextField {...field} select fullWidth SelectProps={{ native: true }}>
                  <option value="">Select a Product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="supplier"
              control={control}
              render={({ field }) => (
                <TextField {...field} select fullWidth SelectProps={{ native: true }}>
                  <option value="">Select a Supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                  ))}
                </TextField>
              )}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <MyDatePickerField label="Expected Delivery Date" name="expected_delivery_date" control={control} fullWidth />
            <Box sx={{ width: '50%' }}>
              <Controller
                name="quantity"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Quantity" type="number" inputProps={{ min: 0 }} fullWidth />
                )}
              />
            </Box>
          </Box>

          <MyMultiLineField label="Notes" name="notes" control={control} placeholder="Note to Supplier" fullWidth />

          <Box sx={{ display: 'flex', justifyContent: 'start' }}>
            <Button variant="contained" type="submit" sx={{ width: '120px' }}>Submit</Button>
          </Box>
        </Box>
      </form>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ marginLeft: '20px', mb: 2 }}>Purchase Orders</Typography>
        <MaterialReactTable
          columns={columns}
          data={purchaseOrders}
          state={{ isLoading: loading }}
          enableRowActions
          renderRowActions={({ row }) => (
            <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: '8px' }}>
              <IconButton
                color="secondary"
                onClick={() => handleEditStatusClick(row.original.id, row.original.status)}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                color="error"
                onClick={() => {
                  setDeletePOId(row.original.id);
                  setConfirmDeleteOpen(true);
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        />
      </Box>

      {/* Status Edit Modal */}
      <Dialog open={editStatusModalOpen} onClose={() => setEditStatusModalOpen(false)}>
        <DialogTitle>Edit Purchase Order Status</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Controller
            name="new_status"
            control={control}
            defaultValue={currentStatus}
            render={({ field }) => (
            <TextField
              {...field}
              select
              fullWidth
              >
      <MenuItem value="PENDING">PENDING</MenuItem>
      <MenuItem value="RECEIVED">RECEIVED</MenuItem>
      <MenuItem value="CANCELED">CANCELED</MenuItem>
    </TextField>
  )}
/>

          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditStatusModalOpen(false)}>Cancel</Button>
          <Button
            onClick={handleStatusUpdate}
            color="primary"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
  <DialogTitle>Confirm Deletion</DialogTitle>
  <DialogContent>
    Are you sure you want to delete this purchase order?
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
    <Button onClick={handleDelete} color="error">Delete</Button>
  </DialogActions>
</Dialog>

      {/* Snackbar for alerts */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}
       anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={snackbarSeverity} onClose={handleCloseSnackbar}>{snackbarMessage}</Alert>
      </Snackbar>
    </div>
  );
};

export default PurchaseOrder;
