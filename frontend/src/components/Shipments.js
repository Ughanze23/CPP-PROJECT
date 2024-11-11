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
  ListItemText } from '@mui/material'; 
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
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [shippingPartners, setShippingPartners] = useState([]);
  const [loading, setLoading] = useState(true);

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

  //load data on pageload
  useEffect(() => {
    fetchShippingPartners();
  }, []);

  //declare column names
  const columns = useMemo(
    () => [
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

  
  //show or hide form
  const handleForm1 = () => {
    setShowForm1(!showForm1);
    reset();
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const deliveryZones = Array.from({ length: 24 }, (_, i) => i + 1);


  //submit form
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
      // Refresh the table data
      fetchShippingPartners();
    } catch (error) {
      console.error("Failed to create Delivery Partner:", error);
      if (error.response && error.response.data) {
        const errorMsg = 
          error.response.data.detail || 
          error.response.data.name?.[0] || 
          "Error creating Delivery Partner. Please try again.";
        setSnackbarMessage(errorMsg);
      } else {
        setSnackbarMessage("Error creating Delivery Partner. Please try again.");
      }
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
    }
  };

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

      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" sx={{ marginLeft: '20px', mb: 2 }}>
          Delivery Partners
        </Typography>
        <MaterialReactTable 
          columns={columns}
          data={shippingPartners}
          state={{ isLoading: loading }}
        enableRowActions
        renderRowActions={() => (
          <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: '8px' }}>
          
            <IconButton
              color="secondary"
             
            >
              <EditIcon />
            </IconButton>
            <IconButton
           
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        )}
        />
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
  );
};

export default Shipments;