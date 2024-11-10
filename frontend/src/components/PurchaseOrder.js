import { useState, useEffect, useMemo } from 'react';
import api from "../api";
import { Box, Button, Snackbar, Alert, TextField } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import MyMultiLineField from './Forms/MyMultilineField';
import MyDatePickerField from './Forms/MyDatePickerField';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';

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
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const { handleSubmit, control, reset } = useForm({ defaultValues });

  // Fetch all required data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, suppliersResponse, purchaseOrdersResponse] = await Promise.all([
          api.get('/api/products/'),
          api.get('/api/suppliers/'),
          api.get('/api/purchase-orders/')
        ]);
        setProducts(productsResponse.data);
        setSuppliers(suppliersResponse.data);
        setPurchaseOrders(purchaseOrdersResponse.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setSnackbarMessage('Error loading data. Please refresh the page.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper function to get product name by ID
  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  // Helper function to get supplier name by ID
  const getSupplierName = (supplierId) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : 'Unknown Supplier';
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'PO #',
        size: 100,
      },
      {
        accessorKey: 'product_id',
        header: 'Product',
        size: 200,
        Cell: ({ row }) => getProductName(row.original.product_id),
      },
      {
        accessorKey: 'supplier_id',
        header: 'Supplier',
        size: 200,
        Cell: ({ row }) => getSupplierName(row.original.supplier_id),
      },
      {
        accessorKey: 'quantity',
        header: 'Quantity',
        size: 120,
      },
      {
        accessorKey: 'expected_delivery_date',
        header: 'Expected Delivery',
        size: 150,
        Cell: ({ row }) => dayjs(row.original.expected_delivery_date).format('DD/MM/YYYY'),
      },
      {
        accessorKey: 'notes',
        header: 'Notes',
        size: 200,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 120,
      },
    ],
    [products, suppliers]
  );

  const table = useMaterialReactTable({
    columns,
    data: purchaseOrders,
    state: { isLoading: loading },
    enableRowSelection: false,
    initialState: { density: 'compact' },
    enableColumnResizing: true,
    enableFullScreenToggle: false,
    enableDensityToggle: false,
    enableHiding: false,
    muiTableBodyRowProps: { hover: true },
  });

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // submit form
  const onSubmit = async (data) => {
    try {
      const expDate = dayjs(data.expected_delivery_date["$d"]).format("YYYY-MM-DD");

      await api.post("/api/purchase-orders/", {
        product_id: parseInt(data.product),
        supplier_id: parseInt(data.supplier),
        notes: data.notes,
        expected_delivery_date: expDate,
        quantity: parseInt(data.quantity)
      });

      // Refresh the purchase orders data
      const response = await api.get('/api/purchase-orders/');
      setPurchaseOrders(response.data);

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

        <Box sx={{ display: 'flex', width: '70%', boxShadow: 3, padding: 3, flexDirection: 'column', gap: 3, mb: 4 }}>
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
                    fullWidth
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

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ marginLeft: '20px', mb: 2 }}>
          Purchase Orders
        </Typography>
        <MaterialReactTable table={table} />
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

export default PurchaseOrder;