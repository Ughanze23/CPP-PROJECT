import React, { useState, useEffect, useMemo } from 'react';
import api from "../api";
import { useForm, Controller } from 'react-hook-form';
import dayjs from 'dayjs';
import { 
  Box, 
  Snackbar, 
  Alert, 
  Typography, 
  Button, 
  TextField, 
  IconButton, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle
} from '@mui/material'; 
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { Edit as EditIcon } from '@mui/icons-material';

const Inventory = () => {
  const { control, getValues } = useForm({});

  const [inventory, setInventory] = useState([]);  
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [editExpiryModalOpen, setEditExpiryModalOpen] = useState(false);
  const [currentId, setId] = useState(null);
  const [currentExpiryDate, setCurrentExpiryDate] = useState('');

  //fetch inventory data
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

  //load data on page load
  useEffect(() => {
    getData();
  }, []);

  //declare table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',  
        header: 'ID',
        size: 150,
      },
      {
        accessorKey: 'batch_id',  
        header: 'Batch_ID',
        size: 150,
      },
      {
        accessorKey: 'created_at',  
        header: 'Created At',
        size: 150,
      },
      {
        accessorKey: 'product.name',
        header: 'Product',
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

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleEditExpiryClick = (id, currentExpiryDate) => {
    setId(id);
    setCurrentExpiryDate(currentExpiryDate);
    setEditExpiryModalOpen(true);
  };

  const handleExpiryUpdate = async () => {
    try {
      const { new_expiry_date } = getValues();

      if (!new_expiry_date) {
        throw new Error("New expiry date is not selected");
      }

      const currentInventoryItem = inventory.find((item) => item.id === currentId);
      if (!currentInventoryItem) {
        throw new Error("Inventory item not found");
      }

      const expDate = dayjs(new_expiry_date).format("YYYY-MM-DD");

      await api.put(`/api/inventory/${currentId}/`, {
        product_id: currentInventoryItem.product.id,
        quantity: currentInventoryItem.quantity,
        status: currentInventoryItem.status,
        expiry_date: expDate
      });

      await getData();

      setSnackbarMessage("Expiry date updated successfully!");
      setSnackbarSeverity("success");
      setEditExpiryModalOpen(false);
    } catch (error) {
      console.error("Failed to update expiry date:", error);
      setSnackbarMessage("Error updating expiry date. Please try again.");
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
    }
  };

  return (
    <div>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ marginLeft: '20px', mb: 2 }}>
          Inventory
        </Typography>
        <MaterialReactTable
          columns={columns}
          data={inventory}
          state={{ isLoading: loading }}
          enableRowActions
          renderRowActions={({ row }) => (
            <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: '8px' }}>
              <IconButton
                color="secondary"
                onClick={() => handleEditExpiryClick(row.original.id, row.original.expiry_date)}
              >
                <EditIcon />
              </IconButton>
            </Box>
          )}
        />
      </Box>

      {/* Expiry Date Edit Modal */}
      <Dialog open={editExpiryModalOpen} onClose={() => setEditExpiryModalOpen(false)}>
        <DialogTitle>Update Expiry Date</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Controller
              name="new_expiry_date"
              control={control}
              defaultValue={currentExpiryDate}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="date"
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditExpiryModalOpen(false)}>Cancel</Button>
          <Button
            onClick={handleExpiryUpdate}
            color="primary"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

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