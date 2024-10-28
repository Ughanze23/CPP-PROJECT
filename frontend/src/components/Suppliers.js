import React, { useState } from 'react';
import api from "../api";
import { Box, Button, Snackbar, Alert } from '@mui/material'; 
import { useForm } from 'react-hook-form';
import Grid from '@mui/material/Grid2';
import MyTextField from './Forms/MyTextField';
import MyMultiLineField from './Forms/MyMultilineField';

const Suppliers = () => {
  const defaultValues = {
    name: '',
    contact_email: '',
    contact_phone: '',
    address: ''
  };

  const [showForm1, setShowForm1] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const { handleSubmit, control, reset } = useForm({ defaultValues: defaultValues });

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
      reset();
      handleForm1();
    } catch (error) {
      console.error("Failed to create Supplier:", error);
      reset();
      handleForm1();
      if (error.response && error.response.data) {
        const errorMsg = error.response.data.detail || "Error creating Supplier. Please try again.";
        setSnackbarMessage(errorMsg);
      } else {
        setSnackbarMessage("Error creating Supplier. Please try again.");
      }
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
    }
  };

  return (
    <div>
      <Grid container spacing={2}>
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

      <Snackbar open={snackbarOpen} autoHideDuration={5000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default Suppliers;
