import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import axios from 'axios';

export default function OwnerAddProduct({ token, storeId, onProductAdded }) {
  const [form, setForm] = useState({ name: '', description: '', price: '' });
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
      setError('Product name must be between 1 and 60 characters.');
      return;
    }
    if (form.description.length > 400) {
      setError('Description must be less than 400 characters.');
      return;
    }
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) {
      setError('Price must be a positive number.');
      return;
    }
    try {
      await axios.post(`http://localhost:5000/api/products`, { ...form, store_id: storeId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(true);
      setError('');
      setForm({ name: '', description: '', price: '' });
      if (onProductAdded) onProductAdded();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add product');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, mb: 2 }}>
      <Typography variant="h6" mb={2}>Add Product</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Product added successfully!</Alert>}
      <TextField
        label="Product Name"
        name="name"
        value={form.name}
        onChange={handleChange}
        fullWidth
        required
        inputProps={{ minLength: 1, maxLength: 60 }}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Description"
        name="description"
        value={form.description}
        onChange={handleChange}
        fullWidth
        multiline
        rows={2}
        inputProps={{ maxLength: 400 }}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Price"
        name="price"
        value={form.price}
        onChange={handleChange}
        fullWidth
        required
        type="number"
        inputProps={{ min: 0.01, step: 0.01 }}
        sx={{ mb: 2 }}
      />
      <Button type="submit" variant="contained" color="primary" fullWidth>
        Add Product
      </Button>
    </Box>
  );
}
