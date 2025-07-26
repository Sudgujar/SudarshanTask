import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Alert } from '@mui/material';
import axios from 'axios';

export default function UpdatePassword({ token }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setPassword(e.target.value);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/.test(password)) {
      setError('Password must be 8-16 chars, include uppercase and special char');
      return;
    }
    try {
      await axios.put('http://localhost:5000/api/users/password', { password }, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess('Password updated!');
      setError('');
      setPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update password');
      setSuccess('');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, mb: 4 }}>
      <Typography variant="h6" mb={2}>Update Password</Typography>
      <TextField
        label="New Password"
        type="password"
        value={password}
        onChange={handleChange}
        fullWidth
        required
        inputProps={{ minLength: 8, maxLength: 16 }}
        sx={{ mb: 2 }}
      />
      <Button type="submit" variant="contained" color="primary">Update</Button>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
    </Box>
  );
}
