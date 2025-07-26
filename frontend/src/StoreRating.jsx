import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Rating, Alert } from '@mui/material';
import axios from 'axios';

export default function StoreRating({ storeId, token, userRating, onRatingChange }) {
  const [rating, setRating] = useState(userRating || 0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError('Rating must be between 1 and 5');
      setSuccess('');
      return;
    }
    try {
      await axios.post(`http://localhost:5000/api/ratings/${storeId}`, { rating }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setError('');
      setSuccess('Rating submitted!');
      if (onRatingChange) onRatingChange(rating);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit rating');
      setSuccess('');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} mt={2}>
      <Typography variant="subtitle1">Your Rating:</Typography>
      <Rating
        name="user-rating"
        value={rating}
        onChange={(e, newValue) => setRating(newValue)}
        max={5}
      />
      <Button type="submit" variant="contained" sx={{ ml: 2 }}>
        Submit
      </Button>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
    </Box>
  );
}
