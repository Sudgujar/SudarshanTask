import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import axios from 'axios';

export default function OwnerAddStore({ token, user, onStoreAdded }) {
  const [form, setForm] = useState({ name: '', email: '', address: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.name.length < 1 || form.name.length > 60) {
      setError('Name must be between 1 and 60 characters.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setError('Invalid email address.');
      return;
    }
    if (form.address.length > 400) {
      setError('Address must be less than 400 characters.');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/stores', { ...form, owner_id: user.id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(true);
      setError('');
      setForm({ name: '', email: '', address: '' });
      if (onStoreAdded) onStoreAdded();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add store');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, mb: 2 }}>
      <Typography variant="h6" mb={2}>Add Your Store</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Store added successfully!</Alert>}
      <TextField
        label="Store Name"
        name="name"
        value={form.name}
        onChange={handleChange}
        fullWidth
        required
        inputProps={{ minLength: 1, maxLength: 60 }}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Store Email"
        name="email"
        value={form.email}
        onChange={handleChange}
        fullWidth
        required
        sx={{ mb: 2 }}
      />
      <TextField
        label="Store Address"
        name="address"
        value={form.address}
        onChange={handleChange}
        fullWidth
        required
        inputProps={{ maxLength: 400 }}
        sx={{ mb: 2 }}
      />
      <Button type="submit" variant="contained" color="primary" fullWidth>
        Add Store
      </Button>
    </Box>
  );
}
