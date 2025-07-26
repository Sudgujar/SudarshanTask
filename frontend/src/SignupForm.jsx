
import React from 'react';
import { Box, TextField, Button, Typography, Alert, Select, MenuItem } from '@mui/material';
import axios from 'axios';

const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
const validatePassword = (password) => /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/.test(password);

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SignupForm() {
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.name.length < 4 || form.name.length > 60) {
      setError('Name must be between 4 and 60 characters.');
      return;
    }
    if (form.address.length > 400) {
      setError('Address must be less than 400 characters.');
      return;
    }
    if (!validateEmail(form.email)) {
      setError('Invalid email address.');
      return;
    }
    if (!validatePassword(form.password)) {
      setError('Password must be 8-16 chars, include an uppercase letter and a special character.');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/auth/signup', form);
      setError('');
      setShowLogin(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="h5" mb={2}>Sign Up</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField
        label="Name"
        name="name"
        value={form.name}
        onChange={handleChange}
        fullWidth
        required
        inputProps={{ minLength: 4, maxLength: 60 }}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Email"
        name="email"
        value={form.email}
        onChange={handleChange}
        fullWidth
        required
        sx={{ mb: 2 }}
      />
      <TextField
        label="Address"
        name="address"
        value={form.address}
        onChange={handleChange}
        fullWidth
        required
        inputProps={{ maxLength: 400 }}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        fullWidth
        required
        inputProps={{ minLength: 8, maxLength: 16 }}
        sx={{ mb: 2 }}
      />
      <Select
        label="Role"
        name="role"
        value={form.role}
        onChange={handleChange}
        fullWidth
        required
        sx={{ mb: 2 }}
      >
        <MenuItem value="user">Normal User</MenuItem>
        <MenuItem value="admin">System Administrator</MenuItem>
        <MenuItem value="owner">Store Owner</MenuItem>
      </Select>
      <Button type="submit" variant="contained" color="primary" fullWidth>
        Register
      </Button>
      {showLogin && (
        <Button variant="outlined" color="primary" fullWidth sx={{ mt: 2 }} onClick={() => navigate('/login')}>
          Go to Login
        </Button>
      )}
    </Box>
  );
}
