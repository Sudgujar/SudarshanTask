import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Chip,
  Alert,
  Snackbar,
  Tooltip,
  Card,
  CardContent,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Store as StoreIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import axios from 'axios';

export default function AdminStoreManagement({ token }) {
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', address: '', owner_id: '' });
  const [owners, setOwners] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchStores();
    fetchOwners();
  }, []);

  const fetchStores = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/stores', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStores(res.data);
    } catch {
      showSnackbar('Error fetching stores', 'error');
    }
  };

  const fetchOwners = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users?role=owner', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOwners(res.data);
    } catch {
      showSnackbar('Error fetching store owners', 'error');
    }
  };

  const handleEditStore = (store) => {
    setSelectedStore(store);
    setEditForm({
      name: store.name,
      email: store.email,
      address: store.address,
      owner_id: store.owner_id || ''
    });
    setEditDialogOpen(true);
  };

  const handleViewStore = (store) => {
    setSelectedStore(store);
    setViewDialogOpen(true);
  };

  const handleDeleteStore = async (storeId) => {
    if (!window.confirm('Are you sure you want to delete this store? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/stores/${storeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showSnackbar('Store deleted successfully', 'success');
      fetchStores();
    } catch (error) {
      showSnackbar(error.response?.data?.error || 'Error deleting store', 'error');
    }
  };

  const handleUpdateStore = async () => {
    try {
      await axios.put(`http://localhost:5000/api/stores/${selectedStore.id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showSnackbar('Store updated successfully', 'success');
      setEditDialogOpen(false);
      fetchStores();
    } catch (error) {
      showSnackbar(error.response?.data?.error || 'Error updating store', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getOwnerName = (ownerId) => {
    const owner = owners.find(o => o.id === ownerId);
    return owner ? owner.name : 'Unknown';
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'success';
    if (rating >= 3) return 'warning';
    return 'error';
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Store Management</Typography>

      {/* Store Statistics */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <StoreIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stores.length}</Typography>
                  <Typography variant="body2">Total Stores</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <StarIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {stores.length > 0 
                      ? (stores.reduce((sum, store) => sum + (store.avg_rating || 0), 0) / stores.length).toFixed(1)
                      : 0
                    }
                  </Typography>
                  <Typography variant="body2">Average Rating</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'warning.light', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUpIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {stores.filter(store => (store.avg_rating || 0) >= 4).length}
                  </Typography>
                  <Typography variant="body2">High Rated Stores</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Stores Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Store Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Average Rating</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stores.map((store) => (
              <TableRow key={store.id}>
                <TableCell>{store.name}</TableCell>
                <TableCell>{store.email}</TableCell>
                <TableCell>{store.address}</TableCell>
                <TableCell>{getOwnerName(store.owner_id)}</TableCell>
                <TableCell>
                  <Chip
                    label={`${Number(store.avg_rating || 0).toFixed(1)} ⭐`}
                    color={getRatingColor(store.avg_rating || 0)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton size="small" onClick={() => handleViewStore(store)}>
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit Store">
                    <IconButton size="small" onClick={() => handleEditStore(store)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Store">
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteStore(store.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Store Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Store</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Store Name"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              fullWidth
            />
            <TextField
              label="Address"
              value={editForm.address}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <FormControl fullWidth>
              <InputLabel>Owner</InputLabel>
              <Select
                value={editForm.owner_id}
                onChange={(e) => setEditForm({ ...editForm, owner_id: e.target.value })}
                label="Owner"
              >
                <MenuItem value="">No Owner</MenuItem>
                {owners.map((owner) => (
                  <MenuItem key={owner.id} value={owner.id}>
                    {owner.name} ({owner.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateStore} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>

      {/* View Store Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Store Details</DialogTitle>
        <DialogContent>
          {selectedStore && (
            <Box mt={1}>
              <Typography variant="body1"><strong>Store Name:</strong> {selectedStore.name}</Typography>
              <Typography variant="body1"><strong>Email:</strong> {selectedStore.email}</Typography>
              <Typography variant="body1"><strong>Address:</strong> {selectedStore.address}</Typography>
              <Typography variant="body1"><strong>Owner:</strong> {getOwnerName(selectedStore.owner_id)}</Typography>
              <Typography variant="body1">
                <strong>Average Rating:</strong>
                <Chip
                  label={`${Number(selectedStore.avg_rating || 0).toFixed(1)} ⭐`}
                  color={getRatingColor(selectedStore.avg_rating || 0)}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>
              <Typography variant="body1"><strong>Store ID:</strong> {selectedStore.id}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 