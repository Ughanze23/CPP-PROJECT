import React, { useState, useEffect, useMemo } from 'react';
import api from "../api";
import { Box, Button, Snackbar, Alert, Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import { useForm } from 'react-hook-form';
import Grid from '@mui/material/Grid2';
import MyTextField from './Forms/MyTextField';
import MyMultiLineField from './Forms/MyMultilineField';
import { MaterialReactTable } from 'material-react-table';
import Typography from '@mui/material/Typography';
import { IconButton } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const Suppliers = () => {
  const defaultValues = {
    name: '',
    contact_email: '',
    contact_phone: '',
    address: ''
  };

  const [suppliers, setSuppliers] = useState([]);  
  const [loading, setLoading] = useState(true);
  const [showForm1, setShowForm1] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [deleteSupplierId, setDeleteSupplierId] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const getData = async () => {
    try {
      const res = await api.get('/api/suppliers/');
      setSuppliers(res.data);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
      setSnackbarMessage('Error loading suppliers');
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
        accessorKey: 'id', 
        header: 'ID',
        size: 100,
        enableHiding: true, 
      },
      {
        accessorKey: 'name',  
        header: 'Name',
        size: 150,
      },
      {
        accessorKey: 'contact_email',
        header: 'Email',
        size: 200,
      },
      {
        accessorKey: 'contact_phone',
        header: 'Phone',
        size: 150,
      },
      {
        accessorKey: 'address',
        header: 'Address',
        size: 200,
      },
    ],
    []
  );

  const { handleSubmit, control, reset } = useForm({ defaultValues });

  const handleForm1 = () => {
    setShowForm1(!showForm1);
    reset();
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const onSubmit1 = async (data) => {
    try {
      await api.post("/api/suppliers/", {
        name: data.name,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        address: data.address
      });
      setSnackbarMessage("Supplier created successfully!");
      setSnackbarSeverity("success");
      getData();  
      reset();
      handleForm1();
    } catch (error) {
      console.error("Failed to create Supplier:", error);
      const errorMsg = error.response?.data?.detail || "Error creating Supplier. Please try again.";
      setSnackbarMessage(errorMsg);
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
    }
  };

  //handle supplier deletion
  const handleDelete = async () => {
    if (!deleteSupplierId) {
      console.error('No supplier ID to delete');
      return;
    }

    try {
      await api.delete(`/api/suppliers/${deleteSupplierId}/`);
      setSnackbarMessage('Supplier deleted successfully!');
      setSnackbarSeverity('success');
      getData();
    } catch (error) {
      console.error('Failed to delete supplier:', error);
      setSnackbarMessage('Error deleting supplier');
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
      setConfirmDeleteOpen(false);
      setDeleteSupplierId(null);
    }
  };

  return (
    <div>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={8} lg={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', boxShadow: 3, p: 2, width: '100%' }}>
            <Button variant="contained" onClick={handleForm1} fullWidth>
              Add Supplier
            </Button>

            {showForm1 && (
              <form onSubmit={handleSubmit(onSubmit1)} style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <MyTextField
                  label="Supplier Name"
                  name="name"
                  control={control}
                  placeholder="Enter Supplier Name"
                  fullWidth
                />
                <MyTextField
                  label="Email"
                  name="contact_email"
                  control={control}
                  placeholder="Enter Supplier Email"
                  type="email"
                  fullWidth
                />
                <MyTextField
                  label="Contact Phone"
                  name="contact_phone"
                  control={control}
                  placeholder="Enter Supplier Phone (353XXXXXXXX)"
                  fullWidth
                  inputProps={{
                    maxLength: 12,
                  }}
                />
                <MyMultiLineField
                  label="Address"
                  name="address"
                  control={control}
                  placeholder="Enter Supplier Address"
                  fullWidth
                />
                <Button type="submit" variant="contained" fullWidth>
                  Add
                </Button>
              </form>
            )}
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ marginLeft: '20px', mb: 2 }}>
          Suppliers
        </Typography>
        <MaterialReactTable 
          columns={columns}
          data={suppliers}
          state={{isLoading: loading}}
          enableRowActions
          renderRowActions={({ row }) => (  
            <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: '8px' }}>
              <IconButton
                color="secondary"
                onClick={() => {
                  // Handle edit action for the current row
                }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                color="error"
                onClick={() => {
                  const supplierId = row.getValue('id');  
                  if (supplierId) {
                    setDeleteSupplierId(supplierId);
                    setConfirmDeleteOpen(true);
                  } else {
                    console.error('No supplier ID found for row:', row);
                    setSnackbarMessage('Error: Could not identify supplier');
                    setSnackbarSeverity('error');
                    setSnackbarOpen(true);
                  }
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        />
      </Box>

      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this supplier?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>Delete</Button>
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
  );
};

export default Suppliers;