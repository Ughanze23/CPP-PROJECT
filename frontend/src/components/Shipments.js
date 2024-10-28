import React, { useState } from 'react';
import api from "../api";
import { Box, Button, Snackbar, Alert, Typography, MenuItem, Select, FormControl, InputLabel, Checkbox, ListItemText } from '@mui/material'; 
import { useForm, Controller } from 'react-hook-form';
import Grid from '@mui/material/Grid2';
import MyTextField from './Forms/MyTextField';

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

  const { setValue, handleSubmit, control, reset } = useForm({ defaultValues: defaultValues });

  const handleForm1 = () => {
    setShowForm1(!showForm1);
    reset();
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const onSubmit1 = async (data) => {
    // Handle Form Submission
    try {
      await api.post("/api/shipping/", {
        logistics_company: data.logistics_company,
        contact_person: data.contact_person,
        email: data.email,
        delivery_zone: data.delivery_zone
      });
      setSnackbarMessage("Delivery Partner created successfully!");
      setSnackbarSeverity("success");
      reset();  // Reset form fields after successful submission
      handleForm1(); // Close card once form is submitted successfully
    } catch (error) {
      console.error("Failed to create Delivery Partner:", error);
      reset();  
      handleForm1(); 
      if (error.response && error.response.data) {
        // Check for specific error messages in different forms
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
  //zones in dublin
  const deliveryZones = Array.from({ length: 24 }, (_, i) => i + 1); // Array of numbers from 1 to 24

  return (
    <div>
      <Grid container spacing={2}>
  
        <Grid item xs={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', boxShadow: 3, p: 2, width: '100%' }}>
            <Button variant="contained" onClick={handleForm1} fullWidth>
              Add Delivery Company
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

      {/* Snackbar for Alerts */}
      <Snackbar open={snackbarOpen} autoHideDuration={5000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Shipments;
