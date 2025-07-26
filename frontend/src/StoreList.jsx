import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, CircularProgress, Select, MenuItem } from '@mui/material';
import axios from 'axios';
import StoreRating from './StoreRating';

export default function StoreList({ token }) {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState({ name: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [userRatings, setUserRatings] = useState({});
  const [selectedStore, setSelectedStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(0);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.name) params.name = search.name;
      if (search.address) params.address = search.address;
      const res = await axios.get('http://localhost:5000/api/stores', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setStores(res.data);
      // Fetch user ratings for each store
      if (token) {
        const ratings = {};
        for (const store of res.data) {
          try {
            const r = await axios.get(`http://localhost:5000/api/ratings/${store.id}/user`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            ratings[store.id] = r.data.rating;
          } catch {
            ratings[store.id] = null;
          }
        }
        setUserRatings(ratings);
      }
    } catch {
      setStores([]);
    }
    setLoading(false);
  };

  const fetchProducts = async (storeId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/products/store/${storeId}`, { headers: { Authorization: `Bearer ${token}` } });
      setProducts(res.data);
    } catch {
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchStores();
    // eslint-disable-next-line
  }, []);

  const handleSearch = (e) => {
    setSearch({ ...search, [e.target.name]: e.target.value });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStores();
  };

  const handleRatingChange = (storeId, rating) => {
    setUserRatings({ ...userRatings, [storeId]: rating });
  };

  const handleStoreSelect = (store) => {
    setSelectedStore(store);
    setRating(0);
    setError('');
    fetchProducts(store.id);
  };

  return (
    <Box mt={4}>
      <Typography variant="h4" gutterBottom>Store Listings</Typography>
      <Box component="form" onSubmit={handleSearchSubmit} mb={2} display="flex" gap={2}>
        <TextField label="Store Name" name="name" value={search.name} onChange={handleSearch} />
        <TextField label="Address" name="address" value={search.address} onChange={handleSearch} />
        <Button type="submit" variant="contained">Search</Button>
      </Box>
      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Average Rating</TableCell>
                {token && <TableCell>Your Rating</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {stores.map((store) => (
                <TableRow key={store.id} onClick={() => handleStoreSelect(store)}>
                  <TableCell>{store.name}</TableCell>
                  <TableCell>{store.address}</TableCell>
                  <TableCell>{Number(store.avg_rating).toFixed(2)}</TableCell>
                  {token && (
                    <TableCell>
                      <StoreRating
                        storeId={store.id}
                        token={token}
                        userRating={userRatings[store.id]}
                        onRatingChange={(rating) => handleRatingChange(store.id, rating)}
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {selectedStore && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6">{selectedStore.name}</Typography>
          <Typography>Email: {selectedStore.email}</Typography>
          <Typography>Address: {selectedStore.address}</Typography>
          <Typography>Average Rating: {Number(selectedStore.avg_rating).toFixed(2)}</Typography>
          <Box mt={2}>
            <Typography variant="subtitle1">Products:</Typography>
            <TableContainer component={Paper} sx={{ mb: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.description}</TableCell>
                      <TableCell>{Number(p.price).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Typography variant="subtitle1">Rate this store:</Typography>
            <Select value={rating} onChange={e => setRating(Number(e.target.value))} sx={{ mr: 2 }}>
              <MenuItem value={0}>Select</MenuItem>
              {[1,2,3,4,5].map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
            </Select>
            <Button variant="contained" onClick={() => {/* handleRate logic here */}}>Submit Rating</Button>
            {error && <Typography color="error" mt={1}>{error}</Typography>}
          </Box>
        </Paper>
      )}
    </Box>
  );
}
