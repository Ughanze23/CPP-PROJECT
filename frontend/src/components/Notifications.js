import React, { useState, useEffect, useMemo } from 'react';
import api from "../api";
import { useForm, Controller } from 'react-hook-form';
import { 
  Box, 
  Snackbar, 
  Alert, 
  Typography, 
  MenuItem, Button, TextField, IconButton, Dialog, DialogActions, DialogContent, DialogTitle
 } from '@mui/material'; 
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import {
  Edit as EditIcon
} from '@mui/icons-material';


const Notifications = () => {

  const {  control ,getValues} = useForm({  });

  const [notifications, setNotification] = useState([]);  
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [editStatusModalOpen, setEditStatusModalOpen] = useState(false);
  const [currentId, setId] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('');
  const [tasks, settasks] = useState([]);

  //fetch notification data
  const getData = async () => {
    try {
      const res = await api.get('/api/notifications/');
      setNotification(res.data);
      settasks(res.data)
    } catch (error) {
      console.error('Failed to fetch Notification data:', error);
      setSnackbarMessage('Error loading Notification data');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  //load data on page load
  useEffect(() => {
    getData();
  }, []);

  //declare table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: 'id', 
        header: 'ID',
        size: 100,
        enableHiding: true, 
      },
      {
        accessorKey: 'batch_id',  
        header: 'Batch_ID',
        size: 150,
      },
      {
        accessorKey: 'created_at',  
        header: 'Created At',
        size: 150,
      },
    
      {
        accessorKey: 'updated_at',  
        header: 'Updated At',
        size: 150,
      },
    
      {
        accessorKey: 'status',
        header: 'Status',
        size: 150,
      },
      {
        accessorKey: 'product_name',
        header: 'Product',
        size: 200,
      },
      {
        accessorKey: 'type',
        header: 'Issue',
        size: 200,
      },
      {
        accessorKey: 'notes',
        header: 'Notes',
        size: 200,
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: notifications,  
    state: { isLoading: loading },
  });

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  
const handleEditStatusClick = (id, currentStatus) => {
  setId(id);
  setCurrentStatus(currentStatus);
  setEditStatusModalOpen(true);
};

const handleStatusUpdate = async () => {
  try {
    // Retrieve the new status value from the form
    const { new_status } = getValues();

    if (!new_status) {
      throw new Error("New status is not selected");
    }

    // Find the current notification
    const currentNotification = notifications.find((notification) => notification.id === currentId);
    if (!currentNotification) {
      throw new Error("Notification not found");
    }

    // Send the PUT request to update the status
    await api.put(`/api/notifications/${currentId}/`, {
     
      type : currentNotification.type,
      status: new_status
    });

    // Refresh the data
    await getData();

    setSnackbarMessage("Status updated successfully!");
    setSnackbarSeverity("success");
    setEditStatusModalOpen(false);
  } catch (error) {
    console.error("Failed to update status:", error);
    setSnackbarMessage("Error updating status. Please try again.");
    setSnackbarSeverity("error");
  } finally {
    setSnackbarOpen(true);
  }
};

  return (
    <div><Box sx={{ mt: 4 }}>
    <Typography variant="h6" sx={{ marginLeft: '20px', mb: 2 }}>
    Tasks
    </Typography>
    <MaterialReactTable
          columns={columns}
          data={tasks}
          state={{ isLoading: loading }}
          enableRowActions
          renderRowActions={({ row }) => (
            <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: '8px' }}>
              <IconButton
                color="secondary"
                onClick={() => handleEditStatusClick(row.original.id, row.original.status)}
              >
                <EditIcon />
              </IconButton>
            </Box>
          )}
        />
    

  </Box>

    
     {/* Status Edit Modal */}
     <Dialog open={editStatusModalOpen} onClose={() => setEditStatusModalOpen(false)}>
        <DialogTitle>Edit Tasks Status</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Controller
            name="new_status"
            control={control}
            defaultValue={currentStatus}
            render={({ field }) => (
            <TextField
              {...field}
              select
              fullWidth
              >
      <MenuItem value="OPEN">OPEN</MenuItem>
      <MenuItem value="IN_PROGRESS">In PROGRESS</MenuItem>
      <MenuItem value="CLOSED">CLOSED</MenuItem>
    </TextField>
  )}
              />

          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditStatusModalOpen(false)}>Cancel</Button>
          <Button
            onClick={handleStatusUpdate}
            color="primary"
          >
            Save Changes
          </Button>
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
  )
}

export default Notifications