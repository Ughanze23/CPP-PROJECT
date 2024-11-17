import React, { useState, useEffect, useMemo } from 'react';
import api from "../api";
import {
  Box,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import Grid from '@mui/material/Grid2';
import MyTextField from './Forms/MyTextField';
import MyMultiLineField from './Forms/MyMultilineField';
import { MaterialReactTable } from 'material-react-table';
import Typography from '@mui/material/Typography';
import { IconButton } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const Suppliers = () => {
  const defaultValues = {
    name: '',
    contact_email: '',
    contact_phone: '',
    address: '',
  };

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm1, setShowForm1] = useState(false);
  const [editFormOpen, setEditFormOpen] = useState(false); // Manage edit form visibility
  const [currentSupplier, setCurrentSupplier] = useState(null); // Store the supplier being edited
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [deleteSupplierId, setDeleteSupplierId] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const { handleSubmit, control, reset, setValue } = useForm({ defaultValues });

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

  const handleForm1 = () => {
    setShowForm1(!showForm1);
    reset();
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const onSubmit1 = async (data) => {
    try {
      await api.post("/api/suppliers/", data);
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

  const handleEdit = (supplier) => {
    setCurrentSupplier(supplier);
    setEditFormOpen(true);

    // Populate form fields with current supplier's data
    Object.keys(supplier).forEach((key) => {
      setValue(key, supplier[key]);
    });
  };

  const handleEditSubmit = async (data) => {
    try {
      // Extract only the required fields from the data
      const updatedData = {
        name: data.name,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        address: data.address,
      };
  
      // Send the filtered data in the PUT request
      await api.put(`/api/suppliers/${currentSupplier.id}/`, updatedData);
  
      setSnackbarMessage("Supplier updated successfully!");
      setSnackbarSeverity("success");
      getData(); // Refresh the data after a successful update
      setEditFormOpen(false); // Close the edit form
    } catch (error) {
      console.error("Failed to update Supplier:", error);
  
      const errorMsg =
        error.response?.data?.detail ||
        "Error updating Supplier. Please try again.";
      setSnackbarMessage(errorMsg);
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true); // Show the snackbar notification
    }
  };
  

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
      {/* Add Supplier Form */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={8} lg={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', boxShadow: 3, p: 2, width: '100%' }}>
            <Button variant="contained" onClick={handleForm1} fullWidth>
              Add Supplier
            </Button>

            {showForm1 && (
              <form onSubmit={handleSubmit(onSubmit1)} style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <MyTextField label="Supplier Name" name="name" control={control} placeholder="Enter Supplier Name" fullWidth />
                <MyTextField label="Email" name="contact_email" control={control} placeholder="Enter Supplier Email" type="email" fullWidth />
                <MyTextField label="Contact Phone" name="contact_phone" control={control} placeholder="Enter Supplier Phone (353XXXXXXXX)" fullWidth />
                <MyMultiLineField label="Address" name="address" control={control} placeholder="Enter Supplier Address" fullWidth />
                <Button type="submit" variant="contained" fullWidth>
                  Add
                </Button>
              </form>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Edit Supplier Form */}
      <Dialog open={editFormOpen} onClose={() => setEditFormOpen(false)}>
        <DialogTitle>Edit Supplier</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit(handleEditSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <MyTextField label="Supplier Name" name="name" control={control} fullWidth />
            <MyTextField label="Email" name="contact_email" control={control} fullWidth />
            <MyTextField label="Contact Phone" name="contact_phone" control={control} fullWidth />
            <MyMultiLineField label="Address" name="address" control={control} fullWidth />
            <Button type="submit" variant="contained" fullWidth>
              Save Changes
            </Button>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditFormOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Supplier Table */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ marginLeft: '20px', mb: 2 }}>
          Suppliers
        </Typography>
        <MaterialReactTable
          columns={columns}
          data={suppliers}
          state={{ isLoading: loading }}
          enableRowActions
          renderRowActions={({ row }) => (
            <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: '8px' }}>
              <IconButton color="secondary" onClick={() => handleEdit(row.original)}>
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

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this supplier?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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
