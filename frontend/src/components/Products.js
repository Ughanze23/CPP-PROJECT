import { useState } from 'react';
import api from "../api";
import { Box, Button ,Snackbar, Alert } from '@mui/material'; 
import { useForm } from 'react-hook-form';
import Grid from '@mui/material/Grid2';
import MyTextField from './Forms/MyTextField';
import MySelectField from './Forms/MySelectField';
import MyMultiLineField from './Forms/MyMultilineField';

const Products = () => {
  const defaultValues = {
    CategoryName: '',
    CategoryDescription: '',
  };
  const [showForm1, setShowForm1] = useState(false);
  const [showForm2, setShowForm2] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const { setValue, handleSubmit, control, reset } = useForm(
    { defaultValues: defaultValues }
  );

  const handleForm1 = () => {
    setShowForm1(!showForm1);
    reset();
  };

  const handleForm2 = () => {
    setShowForm2(!showForm2);
    reset();
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const onSubmit1 = async (data) => {
    // Handle Category Form Submission
    try {
      await api.post("/api/categories/", {
        name: data.CategoryName,
        description: data.CategoryDescription
      });
      setSnackbarMessage("Category created successfully!");
      setSnackbarSeverity("success");
      reset();  // Reset form fields after successful submission
      handleForm1(); //close card once form is submitted successfully
    } catch (error) {
      console.error("Failed to create category:", error);
      reset();  
      handleForm1(); 
      if (error.response && error.response.data) {
        // Check for specific error messages in different forms
        const errorMsg = 
          error.response.data.detail || 
          error.response.data.name?.[0] || 
          "Error creating category. Please try again.";
        setSnackbarMessage(errorMsg);
      } else {
        setSnackbarMessage("Error creating category. Please try again.");
      }
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
    }
  };

  const onSubmit2 = (data) => {
    // Handle Product form Submission
    console.log(data);
  };

  return (
    <div>
    <Grid container spacing={2}>
      {/* Product Category Form */}
      <Grid item xs={6}>
        <Box sx={{ display: 'flex', flexDirection: 'column', boxShadow: 3, p: 2, width: '100%' }}>
          <Button variant="contained" onClick={handleForm1} fullWidth>
            Create Category
          </Button>

          {showForm1 && (
            <form onSubmit={handleSubmit(onSubmit1)} style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <MyTextField
                label="Product Category"
                name="CategoryName"
                control={control}
                placeholder="Enter Product Category Name"
                fullWidth
              />
              <MyMultiLineField
                label="Description"
                name="CategoryDescription"
                control={control}
                placeholder="Enter Product Category Description"
                fullWidth
              />
              <Button type="submit" variant="contained" fullWidth>
                Create
              </Button>
            </form>
          )}
        </Box>
      </Grid>

      {/* Products Form*/}
      <Grid item xs={6}>
        <Box sx={{ display: 'flex', flexDirection: 'column', boxShadow: 3, p: 2, width: '100%' }}>
          <Button variant="contained" onClick={handleForm2} fullWidth>
            Create Product
          </Button>
          {showForm2 && (
            <form onSubmit={handleSubmit(onSubmit2)} style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <MyMultiLineField
                label="Product Description"
                name="ProductDescription"
                control={control}
                placeholder="Enter Product Description"
                fullWidth
              />
              <Button type="submit" variant="contained">
                Create
              </Button>
            </form>
          )}
        </Box>
      </Grid>
    </Grid>

    {/* Snackbar for Alerts */}
    <Snackbar open={snackbarOpen} autoHideDuration={5000} onClose={handleCloseSnackbar}  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
      <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
        {snackbarMessage}
      </Alert>
    </Snackbar>
  </div>
);
}
export default Products;
