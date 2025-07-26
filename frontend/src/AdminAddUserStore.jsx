import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Select, MenuItem, Alert } from '@mui/material';
import axios from 'axios';

export default function AdminAddUserStore({ token, onAdded }) {
  const [type, setType] = useState('user');
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '', role: 'user', storeName: '', storeEmail: '', storeAddress: '', ownerId: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleTypeChange = (e) => {
    setType(e.target.value);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (type === 'user') {
      // Validate user fields
      if (form.name.length < 20 || form.name.length > 60) return setError('Name must be 20-60 chars');
      if (!/\S+@\S+\.\S+/.test(form.email)) return setError('Invalid email');
      if (form.address.length > 400) return setError('Address max 400 chars');
      if (!/^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/.test(form.password)) return setError('Password must be 8-16 chars, include uppercase and special char');
      if (!['admin', 'user', 'owner'].includes(form.role)) return setError('Invalid role');
      try {
        await axios.post('http://localhost:5000/api/users', { name: form.name, email: form.email, address: form.address, password: form.password, role: form.role }, { headers: { Authorization: `Bearer ${token}` } });
        setSuccess('User added!');
        setError('');
        onAdded && onAdded();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to add user');
      }
    } else {
      // Validate store fields
      if (form.storeName.length < 1 || form.storeName.length > 60) return setError('Store name must be 1-60 chars');
      if (!/\S+@\S+\.\S+/.test(form.storeEmail)) return setError('Invalid store email');
      if (form.storeAddress.length > 400) return setError('Store address max 400 chars');
      if (!form.ownerId) return setError('Owner ID required');
      try {
        await axios.post('http://localhost:5000/api/stores', { name: form.storeName, email: form.storeEmail, address: form.storeAddress, owner_id: form.ownerId }, { headers: { Authorization: `Bearer ${token}` } });
        setSuccess('Store added!');
        setError('');
        onAdded && onAdded();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to add store');
      }
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, mb: 4 }}>
      <Typography variant="h6" mb={2}>Add New</Typography>
      <Select value={type} onChange={handleTypeChange} sx={{ mb: 2 }}>
        <MenuItem value="user">User</MenuItem>
        <MenuItem value="store">Store</MenuItem>
      </Select>
      {type === 'user' ? (
        <>
          <TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth required sx={{ mb: 2 }} />
          <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth required sx={{ mb: 2 }} />
          <TextField label="Address" name="address" value={form.address} onChange={handleChange} fullWidth required sx={{ mb: 2 }} />
          <TextField label="Password" name="password" type="password" value={form.password} onChange={handleChange} fullWidth required sx={{ mb: 2 }} />
          <Select name="role" value={form.role} onChange={handleChange} fullWidth sx={{ mb: 2 }}>
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="owner">Store Owner</MenuItem>
          </Select>
        </>
      ) : (
        <>
          <TextField label="Store Name" name="storeName" value={form.storeName} onChange={handleChange} fullWidth required sx={{ mb: 2 }} />
          <TextField label="Store Email" name="storeEmail" value={form.storeEmail} onChange={handleChange} fullWidth required sx={{ mb: 2 }} />
          <TextField label="Store Address" name="storeAddress" value={form.storeAddress} onChange={handleChange} fullWidth required sx={{ mb: 2 }} />
          <TextField label="Owner ID" name="ownerId" value={form.ownerId} onChange={handleChange} fullWidth required sx={{ mb: 2 }} />
        </>
      )}
      <Button type="submit" variant="contained" color="primary">Add</Button>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
    </Box>
  );
}
