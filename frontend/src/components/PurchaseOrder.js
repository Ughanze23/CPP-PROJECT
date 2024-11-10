import { useState, useEffect } from 'react';
import api from "../api";
import { Box, Button, Snackbar, Alert, TextField } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import MyMultiLineField from './Forms/MyMultilineField';
import MyDatePickerField from './Forms/MyDatePickerField';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';

const PurchaseOrder = () => {
  const defaultValues = {
    product: '',
    supplier: '',
    notes: '',
    expected_delivery_date: '',
    quantity: 0
  };

  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const { handleSubmit, control, reset } = useForm({ defaultValues });

  // Fetch products and suppliers on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, suppliersResponse] = await Promise.all([
          api.get('/api/products/'),
          api.get('/api/suppliers/')
        ]);
        setProducts(productsResponse.data);
        setSuppliers(suppliersResponse.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setSnackbarMessage('Error loading data. Please refresh the page.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    };
    fetchData();
  }, []);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // submit form
  const onSubmit = async (data) => {
    try {
      console.log(data.expected_delivery_date)
      const expDate = dayjs(data.expected_delivery_date["$d"]).format("YYYY-MM-DD")

      const response = await api.post("/api/purchase-orders/", {
        product_id: parseInt(data.product),
        supplier_id: parseInt(data.supplier),
        notes: data.notes,
        expected_delivery_date: expDate,
        quantity: parseInt(data.quantity)
      });

      setSnackbarMessage("Purchase order created successfully!");
      setSnackbarSeverity("success");
      reset();
    } catch (error) {
      console.error("Failed to create purchase order:", error);
      setSnackbarMessage("Error creating purchase order. Please try again.");
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '70%', marginBottom: '10px' }}>
          <Typography variant="h6" sx={{ marginLeft: '20px' }}>
            Create Purchase Order
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', width: '70%', boxShadow: 3, padding: 3, flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
           
            <Controller
              name="product"
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
                  <option value="">Select a Product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </TextField>
              )}
            />

         
            <Controller
              name="supplier"
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
                  <option value="">Select a Supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </TextField>
              )}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
        
          <MyDatePickerField
            label="Expected Delivery Date"
            name="expected_delivery_date"
            control={control}
            fullWidth
            />
           
            <Box sx={{ width: '50%' }}>
           <Controller
              name="quantity"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Quantity"
                  type="number"
                  inputProps={{ min: 0 }}
                  
                />
              )}
            />
            </Box>
          </Box>
            
           
           

          
            <MyMultiLineField
              label="Notes"
              name="notes"
              control={control}
              placeholder="Note to Supplier"
              fullWidth
            />
          

          <Box sx={{ display: 'flex', justifyContent: 'start' }}>
            <Button variant="contained" type="submit" sx={{ width: '120px' }}>
              Submit
            </Button>
          </Box>
        </Box>
      </form>

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

export default PurchaseOrder;