import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Button, Select, MenuItem } from '@mui/material';
import axios from 'axios';
import AdminAddUserStore from './AdminAddUserStore';

export default function AdminDashboard({ token }) {
  const [stats, setStats] = useState({ users: 0, stores: 0, ratings: 0 });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchStores();
  },);

  const fetchStats = async () => {
    // You should create an API endpoint for stats in backend
    // For now, fetch users, stores, ratings and count them
    const resUsers = await axios.get('http://localhost:5000/api/users', { headers: { Authorization: `Bearer ${token}` } });
    const resStores = await axios.get('http://localhost:5000/api/stores', { headers: { Authorization: `Bearer ${token}` } });
    const resRatings = await axios.get('http://localhost:5000/api/ratings/all', { headers: { Authorization: `Bearer ${token}` } });
    setStats({ users: resUsers.data.length, stores: resStores.data.length, ratings: resRatings.data.length });
  };

  const fetchUsers = async () => {
    const params = { ...filters };
    const res = await axios.get('http://localhost:5000/api/users', { headers: { Authorization: `Bearer ${token}` }, params });
    setUsers(res.data);
  };

  const fetchStores = async () => {
    const res = await axios.get('http://localhost:5000/api/stores', { headers: { Authorization: `Bearer ${token}` } });
    setStores(res.data);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
    fetchStores();
  };

  return (
    <Box mt={4}>
      <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
      <Grid container spacing={2} mb={2}>
        <Grid item xs={4}><Paper sx={{ p: 2 }}>Total Users: {stats.users}</Paper></Grid>
        <Grid item xs={4}><Paper sx={{ p: 2 }}>Total Stores: {stats.stores}</Paper></Grid>
        <Grid item xs={4}><Paper sx={{ p: 2 }}>Total Ratings: {stats.ratings}</Paper></Grid>
      </Grid>
      <AdminAddUserStore token={token} onAdded={() => { fetchUsers(); fetchStores(); fetchStats(); }} />
      <Box component="form" onSubmit={handleFilterSubmit} mb={2} display="flex" gap={2}>
        <TextField label="Name" name="name" value={filters.name} onChange={handleFilterChange} />
        <TextField label="Email" name="email" value={filters.email} onChange={handleFilterChange} />
        <TextField label="Address" name="address" value={filters.address} onChange={handleFilterChange} />
        <Select name="role" value={filters.role} onChange={handleFilterChange} displayEmpty>
          <MenuItem value="">All Roles</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="user">User</MenuItem>
          <MenuItem value="owner">Store Owner</MenuItem>
        </Select>
        <Button type="submit" variant="contained">Filter</Button>
      </Box>
      <Typography variant="h6" mt={2}>Users</Typography>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Role</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.address}</TableCell>
                <TableCell>{user.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="h6" mt={2}>Stores</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Average Rating</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stores.map((store) => (
              <TableRow key={store.id}>
                <TableCell>{store.name}</TableCell>
                <TableCell>{store.email}</TableCell>
                <TableCell>{store.address}</TableCell>
                <TableCell>{Number(store.avg_rating).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
