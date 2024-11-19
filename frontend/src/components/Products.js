import React, { useState, useEffect, useMemo } from 'react';
import api from "../api";
import { Box, Button, Snackbar, Alert, TextField, CircularProgress, IconButton, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'; 
import { useForm, Controller } from 'react-hook-form';
import Grid from '@mui/material/Grid2';
import MyTextField from './Forms/MyTextField';
import MyMultiLineField from './Forms/MyMultilineField';
import { MaterialReactTable } from 'material-react-table';
import Typography from '@mui/material/Typography';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

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

  // Separate form control for edit forms
  const editForm = useForm({
    defaultValues: {
      CategoryName: '',
      CategoryDescription: '',
      ProductName: '',
      ProductDescription: '',
      price: 0,
      stock_quantity: 0,
      category: ''
    }
  });

  // State management
  const [showForm1, setShowForm1] = useState(false);
  const [showForm2, setShowForm2] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [Base64image, setBase64Image] = useState("");
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // New state for delete functionality
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [deleteType, setDeleteType] = useState(null); // 'category' or 'product'
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // State for edit modal
  const [editCategoryOpen, setEditCategoryOpen] = useState(false);
  const [editProductOpen, setEditProductOpen] = useState(false);
  const [editData, setEditData] = useState(null);


  const { setValue, handleSubmit, control, reset } = useForm({ defaultValues });

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categories/');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setSnackbarMessage('Error loading categories');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
    finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/products/');
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setSnackbarMessage('Error loading products');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const categoryColumns = useMemo(() => [
    {
      accessorKey: 'id', 
      header: 'ID',
      size: 100,
      enableHiding: true, 
    },
    { accessorKey: 'name', header: 'Category Name', size: 150 },
    { accessorKey: 'description', header: 'Description', size: 200 },
  ], []);

  const productColumns = useMemo(() => [
    {
      accessorKey: 'id', 
      header: 'ID',
      size: 100,
      enableHiding: true, 
    },
    { accessorKey: 'name', header: 'Product Name', size: 150 },
    { accessorKey: 'description', header: 'Description', size: 200 },
    { 
      accessorKey: 'category.name', 
      header: 'Category', 
      size: 150,
      // Add cell renderer to handle null category
      Cell: ({ row }) => {
        return row.original.category?.name || 'No Category';
      }
    },
    { accessorKey: 'price', header: 'Price', size: 100 },
    { accessorKey: 'stock_quantity', header: 'Stock Quantity', size: 100 },
  ], []);

  //get image base64String.
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

  const handleImageUpload = async (data) => {
    try {

       // Find the category name corresponding to the selected category ID
       const selectedCategory = categories.find(
        (category) => String(category.id) === String(data.category)
      );
  

      const response = await fetch("https://cjolda5u5v2y5b7q6swrtylpli0rypse.lambda-url.eu-west-1.on.aws/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          "image": Base64image, 
          "category": selectedCategory.name,
          "name": data.ProductName,
          "option": "product",
          "httpMethod" : "POST"
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to upload Product image. Response:", errorText);
        throw new Error("Failed to upload Product image");
      }

      const result = await response.json();
      setSnackbarMessage("Image uploaded successfully!");
      setSnackbarSeverity("success");
      return true;
    } catch (error) {
      console.error("Error in handleImageUpload:", error);
      setSnackbarMessage("Error uploading Product image");
      setSnackbarSeverity("error");
      return false;
    } finally {
      setSnackbarOpen(true);
    }
  };

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

  // delete operation handlers
  // Function to initialize the delete confirmation dialog
// Function to initialize the delete confirmation dialog
const handleDeleteClick = (id, type) => {
  setDeleteItemId(id); // Store the ID of the item to be deleted
  setDeleteType(type); // Store the type ('category' or 'product')
  setConfirmDeleteOpen(true); // Open the confirmation dialog
};

// Function to handle the delete process after confirmation
const handleDelete = async () => {
  if (!deleteItemId || !deleteType) {
    console.error("No item selected for deletion");
    return;
  }

  try {
    let name = "";
    let categoryName = "";

    // Determine the name and category (if applicable) of the item to delete
    if (deleteType === "category") {
      const category = categories.find((cat) => cat.id === deleteItemId);
      name = category ? category.name : "";
    } else if (deleteType === "product") {
      const product = products.find((prod) => prod.id === deleteItemId);
      name = product ? product.name : "";
      categoryName = product?.category?.name || "";
    }

    // Make the Lambda call to validate the delete operation
    const response = await fetch(
      "https://cjolda5u5v2y5b7q6swrtylpli0rypse.lambda-url.eu-west-1.on.aws/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category: deleteType === "product" ? categoryName : undefined,
          option: deleteType,
          httpMethod: "DELETE",
        }),
      }
    );
    const lambdaPayload = {
      name,
      category: deleteType === "product" ? categoryName : undefined,
      option: deleteType,
      httpMethod: "DELETE",
    };
      // Log the payload being sent to Lambda
      console.log("Payload sent to Lambda:", lambdaPayload);

    // Check if the Lambda call was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Lambda call failed with status ${response.status} and message:`,
        errorText
      );
      throw new Error("Lambda call failed: " + errorText);
    }

    const lambdaResult = await response.json();
    console.log("Lambda response:", lambdaResult);

    // Proceed with database deletion if Lambda call is successful
    if (deleteType === "category") {
      await api.delete(`/api/categories/${deleteItemId}/`);
      setSnackbarMessage("Category deleted successfully!");
      fetchCategories(); // Refresh categories list
      fetchProducts(); // Refresh products list (to remove products in deleted category)
    } else if (deleteType === "product") {
      await api.delete(`/api/products/${deleteItemId}/`);
      setSnackbarMessage("Product deleted successfully!");
      fetchProducts(); // Refresh products list
    }

    setSnackbarSeverity("success");
  } catch (error) {
    console.error(`Failed to delete ${deleteType}:`, error);
    setSnackbarMessage(
      `Error deleting ${deleteType}. ${
        error.response?.data?.detail || "Please try again."
      }`
    );
    setSnackbarSeverity("error");
  } finally {
    // Close dialog and reset state variables
    setSnackbarOpen(true);
    setConfirmDeleteOpen(false);
    setDeleteItemId(null);
    setDeleteType(null);
  }
};

  const onSubmit1 = async (data) => {
    try {
      // Create the category in the database
      await api.post("/api/categories/", {
        name: data.CategoryName,
        description: data.CategoryDescription,
      });
  
      //Call the Lambda function to create the bucket
      const response = await fetch(
        "https://cjolda5u5v2y5b7q6swrtylpli0rypse.lambda-url.eu-west-1.on.aws/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            "name": data.CategoryName,
            "option": "category",
            "httpMethod" : "POST"
          }),
        }
      );
  
      // Check Lambda response
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to create bucket. Response:", errorText);
        throw new Error("Failed to create bucket");
      }
  
      //
      setSnackbarMessage("Category created successfully!");
      setSnackbarSeverity("success");
      reset();
      handleForm1();
      fetchCategories();
    } catch (error) {
      console.error("Failed to complete the operation:", error);
      setSnackbarMessage("Error creating category. Please try again.");
      setSnackbarSeverity("error");
      handleForm1();
    } finally {
   
      setSnackbarOpen(true);
    }
  };

  const onSubmit2 = async (data) => {
    if (!Base64image) {
      setSnackbarMessage("Please upload a Product image first");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    const uploadSuccess = await handleImageUpload(data);

    if (!uploadSuccess) {
      setSnackbarMessage("Image upload failed, form not submitted");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

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
      fetchProducts();
    } catch (error) {
      console.error("Failed to create product:", error);
      setSnackbarMessage("Error creating product. Please try again.");
      setSnackbarSeverity("error");
      handleForm2();
    } finally {
      setSnackbarOpen(true);
    }
  };

  // Open edit modals with pre-filled data
  const handleEditClick = (row, type) => {
    if (type === 'category') {
      const category = row.original;
      editForm.reset({
        CategoryName: category.name,
        CategoryDescription: category.description
      });
      setEditData(category);
      setEditCategoryOpen(true);
    } else if (type === 'product') {
      const product = row.original;
      editForm.reset({
        ProductName: product.name,
        ProductDescription: product.description,
        // Safely handle null category
        category: product.category?.id?.toString() || "",
        price: product.price,
        stock_quantity: product.stock_quantity
      });
      setEditData(product);
      setEditProductOpen(true);
    }
  };

// Close edit modals
const handleEditModalClose = () => {
  setEditCategoryOpen(false);
  setEditProductOpen(false);
  setEditData(null);
};

// PUT requests for editing
// Modified edit submit handlers
const handleEditCategorySubmit = async (data) => {
  try {
    await api.put(`/api/categories/${editData.id}/`, {
      name: data.CategoryName,
      description: data.CategoryDescription,
    });
    setSnackbarMessage("Category updated successfully!");
    setSnackbarSeverity("success");
    fetchCategories();
    fetchProducts();
  } catch (error) {
    console.error("Failed to update category:", error);
    setSnackbarMessage("Error updating category. Please try again.");
    setSnackbarSeverity("error");
  } finally {
    setSnackbarOpen(true);
    handleEditModalClose();
  }
};

const handleEditProductSubmit = async (data) => {
  try {
    const categoryId = data.category ? parseInt(data.category) : null;
    
    await api.put(`/api/products/${editData.id}/`, {
      name: data.ProductName,
      description: data.ProductDescription,
      category_id: categoryId, 
      price: parseFloat(data.price),
      stock_quantity: parseInt(data.stock_quantity),
    });
    setSnackbarMessage("Product updated successfully!");
    setSnackbarSeverity("success");
    fetchProducts();
  } catch (error) {
    console.error("Failed to update product:", error);
    setSnackbarMessage("Error updating product. Please try again.");
    setSnackbarSeverity("error");
  } finally {
    setSnackbarOpen(true);
    handleEditModalClose();
  }
};

  return (
    <div>
      <Grid container spacing={2}>
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

      <Box sx={{ display: 'flex', mt: 4 }}>
        <Box sx={{ width: '40%', pr: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Categories
          </Typography>
          <MaterialReactTable 
      columns={categoryColumns}
      data={categories}
      state={{isLoading: loading}}
      enableRowActions
      renderRowActions={({ row }) => (
        <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: '8px' }}>
          <IconButton
            color="secondary"
            onClick={() => handleEditClick(row, 'category')}  
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleDeleteClick(row.original.id, 'category')}  
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      )}
    />
        </Box>

        <Box sx={{ width: '60%', pl: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Products
          </Typography>
           {/* Products table */}
    <MaterialReactTable 
      columns={productColumns}
      data={products}
      state={{isLoading: loading}}
      enableRowActions
      renderRowActions={({ row }) => (
        <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: '8px' }}>
          <IconButton
            color="secondary"
            onClick={() => handleEditClick(row, 'product')} 
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleDeleteClick(row.original.id, 'product')}  
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      )}
    />
        </Box>
      </Box>

    {/* Edit Category Modal */}
    <Dialog open={editCategoryOpen} onClose={handleEditModalClose}>
      <DialogTitle>Edit Category</DialogTitle>
      <DialogContent>
        <form
          onSubmit={editForm.handleSubmit(handleEditCategorySubmit)}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}
        >
          <MyTextField
            label="Category Name"
            name="CategoryName"
            control={editForm.control}
            fullWidth
          />
          <MyMultiLineField
            label="Description"
            name="CategoryDescription"
            control={editForm.control}
            fullWidth
          />
          <DialogActions>
            <Button onClick={handleEditModalClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              Save
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>

    {/* Edit Product Modal */}
    <Dialog open={editProductOpen} onClose={handleEditModalClose}>
      <DialogTitle>Edit Product</DialogTitle>
      <DialogContent>
        <form
          onSubmit={editForm.handleSubmit(handleEditProductSubmit)}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}
        >
          <MyTextField
            label="Product Name"
            name="ProductName"
            control={editForm.control}
            fullWidth
          />
          <MyMultiLineField
            label="Product Description"
            name="ProductDescription"
            control={editForm.control}
            fullWidth
          />
          <Controller
            name="category"
            control={editForm.control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Category"
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
            control={editForm.control}
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
         
          <DialogActions>
            <Button onClick={handleEditModalClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              Save
            </Button>
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
          Are you sure you want to delete this {deleteType}?
          {deleteType === 'category' && (
            <Typography color="error" sx={{ mt: 2 }}>
              Warning: Deleting a category will affect all associated products.
            </Typography>
          )}
        </DialogContent>
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

export default Products;