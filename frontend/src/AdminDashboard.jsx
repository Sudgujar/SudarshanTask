import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Card,
  CardContent,
  Alert,
  Snackbar,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Store as StoreIcon,
  Star as StarIcon,
  Dashboard as DashboardIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import axios from 'axios';
import AdminAddUserStore from './AdminAddUserStore';
import AdminStoreManagement from './AdminStoreManagement';
import AdminAnalytics from './AdminAnalytics';

export default function AdminDashboard({ token }) {
  const [stats, setStats] = useState({ users: 0, stores: 0, ratings: 0 });
  const [users, setUsers] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [topStores, setTopStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', address: '', role: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/users/stats/dashboard', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/users', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      setStats(statsRes.data.stats);
      setUsers(usersRes.data);
      setRecentUsers(statsRes.data.recentUsers);
      setTopStores(statsRes.data.topStores);
    } catch {
      showSnackbar('Error fetching dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const params = { ...filters };
      const res = await axios.get('http://localhost:5000/api/users', { 
        headers: { Authorization: `Bearer ${token}` }, 
        params 
      });
      setUsers(res.data);
    } catch {
      showSnackbar('Error fetching users', 'error');
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role
    });
    setEditDialogOpen(true);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showSnackbar('User deleted successfully', 'success');
      fetchDashboardData();
    } catch (error) {
      showSnackbar(error.response?.data?.error || 'Error deleting user', 'error');
    }
  };

  const handleUpdateUser = async () => {
    try {
      await axios.put(`http://localhost:5000/api/users/${selectedUser.id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showSnackbar('User updated successfully', 'success');
      setEditDialogOpen(false);
      fetchDashboardData();
    } catch (error) {
      showSnackbar(error.response?.data?.error || 'Error updating user', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'owner': return 'warning';
      case 'user': return 'primary';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box mt={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchDashboardData}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab 
            icon={<DashboardIcon />} 
            label="Overview" 
            iconPosition="start"
          />
          <Tab 
            icon={<PeopleIcon />} 
            label="User Management" 
            iconPosition="start"
          />
          <Tab 
            icon={<StoreIcon />} 
            label="Store Management" 
            iconPosition="start"
          />
          <Tab 
            icon={<AnalyticsIcon />} 
            label="Analytics" 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box>
          {/* Statistics Cards */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={3}>
              <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <PeopleIcon sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography variant="h4">{stats.users}</Typography>
                      <Typography variant="body2">Total Users</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ bgcolor: 'secondary.light', color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <StoreIcon sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography variant="h4">{stats.stores}</Typography>
                      <Typography variant="body2">Total Stores</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <StarIcon sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography variant="h4">{stats.ratings}</Typography>
                      <Typography variant="body2">Total Ratings</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ bgcolor: 'warning.light', color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <TrendingUpIcon sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography variant="h4">
                        {stats.stores > 0 ? (stats.ratings / stats.stores).toFixed(1) : 0}
                      </Typography>
                      <Typography variant="body2">Avg Ratings/Store</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Activity and Top Stores */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Recent Users</Typography>
                <List dense>
                  {recentUsers.map((user) => (
                    <ListItem key={user.id}>
                      <ListItemText
                        primary={user.name}
                        secondary={`${user.email} • ${user.role} • ${formatDate(user.created_at)}`}
                      />
                      <ListItemSecondaryAction>
                        <Chip 
                          label={user.role} 
                          color={getRoleColor(user.role)} 
                          size="small" 
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Top Rated Stores</Typography>
                <List dense>
                  {topStores.map((store) => (
                    <ListItem key={store.id}>
                      <ListItemText
                        primary={store.name}
                        secondary={`${store.email} • ${store.rating_count || 0} ratings`}
                      />
                      <ListItemSecondaryAction>
                        <Chip 
                          label={`${Number(store.avg_rating || 0).toFixed(1)} ⭐`} 
                          color="primary" 
                          size="small" 
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>

          {/* Add User/Store Component */}
          <AdminAddUserStore token={token} onAdded={fetchDashboardData} />
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Typography variant="h5" gutterBottom>User Management</Typography>
          
          {/* Filters */}
          <Box component="form" onSubmit={handleFilterSubmit} mb={3} display="flex" gap={2} flexWrap="wrap">
            <TextField 
              label="Name" 
              name="name" 
              value={filters.name} 
              onChange={handleFilterChange}
              size="small"
            />
            <TextField 
              label="Email" 
              name="email" 
              value={filters.email} 
              onChange={handleFilterChange}
              size="small"
            />
            <TextField 
              label="Address" 
              name="address" 
              value={filters.address} 
              onChange={handleFilterChange}
              size="small"
            />
            <Select 
              name="role" 
              value={filters.role} 
              onChange={handleFilterChange} 
              displayEmpty
              size="small"
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="">All Roles</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="owner">Store Owner</MenuItem>
            </Select>
            <Button type="submit" variant="contained" size="small">Filter</Button>
            <Button variant="outlined" size="small" onClick={() => setFilters({ name: '', email: '', address: '', role: '' })}>
              Clear
            </Button>
          </Box>

          {/* Users Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.address}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role} 
                        color={getRoleColor(user.role)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleViewUser(user)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit User">
                        <IconButton size="small" onClick={() => handleEditUser(user)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete User">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteUser(user.id)}
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
        </Box>
      )}

      {activeTab === 2 && (
        <AdminStoreManagement token={token} />
      )}

      {activeTab === 3 && (
        <AdminAnalytics token={token} />
      )}

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Name"
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
            <Select
              label="Role"
              value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              fullWidth
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="owner">Store Owner</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateUser} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box mt={1}>
              <Typography variant="body1"><strong>Name:</strong> {selectedUser.name}</Typography>
              <Typography variant="body1"><strong>Email:</strong> {selectedUser.email}</Typography>
              <Typography variant="body1"><strong>Address:</strong> {selectedUser.address}</Typography>
              <Typography variant="body1">
                <strong>Role:</strong> 
                <Chip 
                  label={selectedUser.role} 
                  color={getRoleColor(selectedUser.role)} 
                  size="small" 
                  sx={{ ml: 1 }}
                />
              </Typography>
              <Typography variant="body1"><strong>ID:</strong> {selectedUser.id}</Typography>
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
