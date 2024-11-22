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
  Checkbox, IconButton,
  ListItemText, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'; 
import { useForm, Controller } from 'react-hook-form';
import Grid from '@mui/material/Grid2';
import MyTextField from './Forms/MyTextField';
import { MaterialReactTable } from 'material-react-table';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';


const Shipments = () => {
  const defaultValues = {
    logistics_company: '',
    contact_person: '',
    email: '',
    delivery_zone: []
  };

  const [showForm1, setShowForm1] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false); // Track if edit form is open
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [shippingPartners, setShippingPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteShippingPartnerId, setDeleteShippingPartnerId] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null); // Store selected shipment for editing
  const [shipmentOrders, setShipmentOrders] = useState([]);
const [loadingShipments, setLoadingShipments] = useState(true);

  const { setValue, handleSubmit, control, reset } = useForm({ defaultValues: defaultValues });

  // Fetch shipping partners data
  const fetchShippingPartners = async () => {
    try {
      const response = await api.get('/api/shipping/');
      setShippingPartners(response.data);
    } catch (error) {
      console.error('Failed to fetch shipping partners:', error);
      setSnackbarMessage('Error loading shipping partners');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShippingPartners();
  }, []);

  // Declare column names
  const columns = useMemo(
    () => [
      {
        accessorKey: 'id', 
        header: 'ID',
        size: 100,
        enableHiding: true, 
      },
      {
        accessorKey: 'logistics_company',
        header: 'Delivery Partner',
        size: 200,
      },
      {
        accessorKey: 'contact_person',
        header: 'Contact Person',
        size: 200,
      },
      {
        accessorKey: 'email',
        header: 'Email',
        size: 250,
      },
      {
        accessorKey: 'delivery_zone',
        header: 'Delivery Zones',
        size: 300,
        Cell: ({ row }) => {
          const zones = row.original.delivery_zone;
          return Array.isArray(zones) 
            ? zones.map(zone => `Dublin ${zone}`).join(', ')
            : '';
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 120,
        Cell: ({ row }) => (
          <Box
            sx={{
              backgroundColor: row.original.status ? '#e8f5e9' : '#ffebee',
              padding: '6px 12px',
              borderRadius: '4px',
              display: 'inline-block',
            }}
          >
            {row.original.status ? 'Active' : 'Inactive'}
          </Box>
        ),
      },
    ],
    []
  );


  const shipmentOrderColumns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'Shipment ID',
        size: 100,
      },
      {
        accessorKey: 'order.id',
        header: 'Order ID',
        size: 100,
      },
      {
        accessorKey: 'shipment_provider.logistics_company',
        header: 'Delivery Partner',
        size: 200,
      },
      {
        accessorKey: 'shipping_address',
        header: 'EirCode',
        size: 150,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 150,
        Cell: ({ cell }) => (
          <Box
            sx={{
              backgroundColor: 
                cell.getValue() === 'PENDING' ? '#fff3e0' : 
                cell.getValue() === 'DELIVERED' ? '#e8f5e9' : 
                '#ffebee',
              padding: '6px 12px',
              borderRadius: '4px',
              display: 'inline-block',
            }}
          >
            {cell.getValue()}
          </Box>
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'Created Date',
        size: 200,
        Cell: ({ cell }) => new Date(cell.getValue()).toLocaleString(),
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

  const deliveryZones = Array.from({ length: 24 }, (_, i) => i + 1);

  // Submit form for adding a new shipment
  const onSubmit1 = async (data) => {
    try {
      await api.post("/api/shipping/", {
        logistics_company: data.logistics_company,
        contact_person: data.contact_person,
        email: data.email,
        delivery_zone: data.delivery_zone
      });
      setSnackbarMessage("Delivery Partner created successfully!");
      setSnackbarSeverity("success");
      reset();
      handleForm1();
      fetchShippingPartners();
    } catch (error) {
      console.error("Failed to create Delivery Partner:", error);
      setSnackbarMessage("Error creating Delivery Partner. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // Submit form for editing an existing shipment
  const onSubmitEdit = async (data) => {
    try {
      await api.put(`/api/shipping/${selectedShipment.id}/`, {
        logistics_company: data.logistics_company,
        contact_person: data.contact_person,
        email: data.email,
        delivery_zone: data.delivery_zone,
        status: data.status
      });
      setSnackbarMessage("Delivery Partner updated successfully!");
      setSnackbarSeverity("success");
      setShowEditForm(false);
      reset();
      fetchShippingPartners();
    } catch (error) {
      console.error("Failed to update Delivery Partner:", error);
      setSnackbarMessage("Error updating Delivery Partner. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // Handle delete confirmation
  const handleDelete = async () => {
    if (!deleteShippingPartnerId) {
      console.error('No shipping partner ID to delete');
      return;
    }

    try {
      await api.delete(`/api/shipping/${deleteShippingPartnerId}/`);
      setSnackbarMessage('Shipping partner deleted successfully!');
      setSnackbarSeverity('success');
      fetchShippingPartners();
    } catch (error) {
      console.error('Failed to delete shipping partner:', error);
      setSnackbarMessage('Error deleting shipping partner');
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
      setConfirmDeleteOpen(false);
      setDeleteShippingPartnerId(null);
    }
  };

  //fetch shipment orders data
  const fetchShipmentOrders = async () => {
    try {
      const response = await api.get('/api/shipment-orders/');
      setShipmentOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch shipment orders:', error);
      setSnackbarMessage('Error loading shipment orders');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoadingShipments(false);
    }
  };
  
  useEffect(() => {
    fetchShipmentOrders();
  }, []);

  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', boxShadow: 3, p: 2, width: '100%', mb: 4 }}>
            <Button variant="contained" onClick={handleForm1} fullWidth>
              Add Delivery Partner
            </Button>

            {showForm1 && (
              <form onSubmit={handleSubmit(onSubmit1)} style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <MyTextField
                  label="Delivery Partner"
                  name="logistics_company"
                  control={control}
                  placeholder="Enter Delivery Company Name"
                  fullWidth
                />
                <MyTextField
                  label="Contact Person"
                  name="contact_person"
                  control={control}
                  placeholder="Enter Contact Person Name"
                  fullWidth
                />
                <MyTextField
                  label="Email"
                  name="email"
                  control={control}
                  placeholder="Enter Email(Business email)"
                  type="email"
                  fullWidth
                />
                <FormControl fullWidth>
                  <InputLabel>Delivery Zones</InputLabel>
                  <Controller
                    name="delivery_zone"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        multiple
                        renderValue={(selected) => selected.join(", ")}
                      >
                        {deliveryZones.map((zone) => (
                          <MenuItem key={zone} value={zone}>
                            <Checkbox checked={field.value.includes(zone)} />
                            <ListItemText primary={`Dublin ${zone}`} />
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </FormControl>
                
                <Button type="submit" variant="contained" fullWidth>
                  Add
                </Button>
              </form>
            )}
          </Box>
        </Grid>
      </Grid>
{/* shipping partners table*/}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" sx={{ marginLeft: '20px', mb: 2 }}>
          Delivery Partners
        </Typography>
        <MaterialReactTable 
          columns={columns}
          data={shippingPartners}
          state={{ isLoading: loading }}
          enableRowActions
          renderRowActions={({ row }) => (
            <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: '8px' }}>
              <IconButton
              color="secondary"
                onClick={() => {
                  setSelectedShipment(row.original); // Set the selected shipment for editing
                  setShowEditForm(true); // Open the edit form
                  setValue('logistics_company', row.original.logistics_company);
                  setValue('contact_person', row.original.contact_person);
                  setValue('email', row.original.email);
                  setValue('delivery_zone', row.original.delivery_zone);
                }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
              color="error"
                onClick={() => {
                  setDeleteShippingPartnerId(row.original.id);
                  setConfirmDeleteOpen(true);
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        />
      </Box>
          {/* shipment orders table*/}
      <Box sx={{ mt: 4 }}>
  <Typography variant="h6" sx={{ marginLeft: '20px', mb: 2 }}>
    Shipment Orders
  </Typography>
  <MaterialReactTable 
    columns={shipmentOrderColumns}
    data={shipmentOrders}
    state={{ isLoading: loadingShipments }}
    enableRowActions={false}
  />
</Box>

      {/* Edit Shipping Partner Modal */}
      <Dialog open={showEditForm} onClose={() => setShowEditForm(false)}>
        <DialogTitle>Edit Delivery Partner</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmitEdit)}>
            <MyTextField
              label="Delivery Partner"
              name="logistics_company"
              control={control}
              placeholder="Enter Delivery Company Name"
              fullWidth
            />
            <MyTextField
              label="Contact Person"
              name="contact_person"
              control={control}
              placeholder="Enter Contact Person Name"
              fullWidth
            />
            <MyTextField
              label="Email"
              name="email"
              control={control}
              placeholder="Enter Email(Business email)"
              type="email"
              fullWidth
            />
            <InputLabel>Status</InputLabel>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select {...field}>
                        <MenuItem value="ACTIVE">Active</MenuItem>
                        <MenuItem value="INACTIVE">Inactive</MenuItem>
                      </Select>
                    )}
                  />
            <FormControl fullWidth>
              <InputLabel>Delivery Zones</InputLabel>
              <Controller
                name="delivery_zone"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    multiple
                    renderValue={(selected) => selected.join(", ")}
                  >
                    {deliveryZones.map((zone) => (
                      <MenuItem key={zone} value={zone}>
                        <Checkbox checked={field.value.includes(zone)} />
                        <ListItemText primary={`Dublin ${zone}`} />
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>

            <DialogActions>
              <Button onClick={() => setShowEditForm(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
<Dialog
  open={confirmDeleteOpen}
  onClose={() => setConfirmDeleteOpen(false)}
>
  <DialogTitle>Confirm Delete</DialogTitle>
  <DialogContent>
    Are you sure you want to delete this delivery partner?
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
    <Button onClick={handleDelete} color="error">Delete</Button>
  </DialogActions>
</Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbarSeverity} onClose={handleCloseSnackbar}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Shipments;
