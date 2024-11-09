import { useState, useEffect } from 'react';
import api from "../api";
import { Box, Button, Snackbar, Alert, TextField, CircularProgress } from '@mui/material'; 
import { useForm, Controller } from 'react-hook-form';
import Grid from '@mui/material/Grid2';
import MyTextField from './Forms/MyTextField';
import MyMultiLineField from './Forms/MyMultilineField';

const Products = () => {

  const defaultValues = {
    CategoryName: '',
    CategoryDescription: '',
    ProductName: '',
    ProductDescription: '',
    price: 0,
    stock_quantity: 0,
    category_id: 0
  };

  const [showForm1, setShowForm1] = useState(false);
  const [showForm2, setShowForm2] = useState(false);
  const [categories, setCategories] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [Base64image, setBase64Image] = useState("");
  const [isImageUploading, setIsImageUploading] = useState(false);

  const { setValue, handleSubmit, control, reset } = useForm({ defaultValues });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/api/categories/');
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Convert image to base64 string
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsImageUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(",")[1];
        setBase64Image(base64String);
        setIsImageUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image upload to S3 bucket
  const handleImageUpload = async (data) => {
    try {
      console.log("Starting image upload with data:", {
        image: Base64image,
        category: data.category,
        name: data.ProductName
      });
  
      const response = await fetch("https://cjolda5u5v2y5b7q6swrtylpli0rypse.lambda-url.eu-west-1.on.aws/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({ 
          "image": Base64image, 
          "category": data.category,
          "name": data.ProductName
        }),
      });
  
      console.log("Upload response status:", response.status);
  
      if (!response.ok) {
        // Log the response body for further debugging if available
        const errorText = await response.text();
        console.error("Failed to upload Product image. Response:", errorText);
        throw new Error("Failed to upload Product image");
      }
  
      const result = await response.json();
      console.log("Image upload successful. Result:", result);
  
      setSnackbarMessage("Image uploaded successfully!");
      setSnackbarSeverity("success");
      return true; // Image upload successful
    } catch (error) {
      console.error("Error in handleImageUpload:", error);
      setSnackbarMessage("Error uploading Product image");
      setSnackbarSeverity("error");
      return false; // Image upload failed
    } finally {
      setSnackbarOpen(true);
    }
  };

  // Show or hide create categories form
  const handleForm1 = () => {
    setShowForm1(!showForm1);
    reset();
  };

  // Show or hide create products form
  const handleForm2 = () => {
    setShowForm2(!showForm2);
    reset();
  };

  // Handle closing notifications
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Handle Category Form Submission
  const onSubmit1 = async (data) => {
    try {
      await api.post("/api/categories/", {
        name: data.CategoryName,
        description: data.CategoryDescription
      });
      setSnackbarMessage("Category created successfully!");
      setSnackbarSeverity("success");
      reset();
      handleForm1();
    } catch (error) {
      console.error("Failed to create category:", error);
      setSnackbarMessage("Error creating category. Please try again.");
      setSnackbarSeverity("error");
      handleForm1();
    } finally {
      setSnackbarOpen(true);
    }
  };

  const onSubmit2 = async (data) => {
    // Check if image is added before submitting form
    if (!Base64image) {
      setSnackbarMessage("Please upload a Product image first");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    const uploadSuccess = await handleImageUpload(data); // Wait for image upload to complete

    if (!uploadSuccess) {
      // If image upload failed, don't submit the form
      setSnackbarMessage("Image upload failed, form not submitted");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    // Handle Product form Submission
    try {
      await api.post("/api/products/", {
        name: data.ProductName,
        description: data.ProductDescription,
        category_id: parseInt(data.category),
        price: parseFloat(data.price),
        stock_quantity: parseInt(data.stock_quantity)
      });
      
      setSnackbarMessage("Product created successfully!");
      setSnackbarSeverity("success");
      reset();
      handleForm2();
    } catch (error) {
      console.error("Failed to create product:", error);
      setSnackbarMessage("Error creating product. Please try again.");
      setSnackbarSeverity("error");
      handleForm2();
    } finally {
      setSnackbarOpen(true);
    }
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

        {/* Products Form */}
        <Grid item xs={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', boxShadow: 3, p: 2, width: '100%' }}>
            <Button variant="contained" onClick={handleForm2} fullWidth>
              Create Product
            </Button>
            {showForm2 && (
              <form onSubmit={handleSubmit(onSubmit2)} style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <MyTextField
                  label="Product Name"
                  name="ProductName"
                  control={control}
                  placeholder="Enter Product Name"
                  fullWidth
                />
                <MyMultiLineField
                  label="Product Description"
                  name="ProductDescription"
                  control={control}
                  placeholder="Enter Product Description"
                  fullWidth
                />
                
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      SelectProps={{
                        native: true,
                      }}
                    >
                      <option value="">Select a Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </TextField>
                  )}
                />
                
                <Controller
                  name="price"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Price"
                      type="number"
                      inputProps={{ step: '0.01' }}
                      fullWidth
                    />
                  )}
                />
                
                <Controller
                  name="stock_quantity"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Stock Quantity"
                      type="number"
                      inputProps={{ min: 0 }}
                      fullWidth
                    />
                  )}
                />
                {/* Image Upload Field */}
                <input type="file" label="Product Image" accept="image/*" onChange={handleImageChange} />
                {isImageUploading && <CircularProgress size={24} />}

                <Button type="submit" variant="contained" fullWidth disabled={!Base64image}>
                  Create
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

export default Products;
