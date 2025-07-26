import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import axios from 'axios';
import OwnerAddStore from './OwnerAddStore';
import OwnerAddProduct from './OwnerAddProduct';

export default function OwnerDashboard({ token, user }) {
  const [store, setStore] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchStoreAndRatings();
    // eslint-disable-next-line
  }, []);

  const fetchStoreAndRatings = async () => {
    try {
      // Get store owned by this user
      const resStores = await axios.get('http://localhost:5000/api/stores', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ownedStore = resStores.data.find(s => s.owner_id === user.id);
      setStore(ownedStore);
      if (ownedStore) {
        // Get ratings for this store
        const resRatings = await axios.get(`http://localhost:5000/api/ratings/store/${ownedStore.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRatings(resRatings.data);
        // Calculate average rating
        const avg = resRatings.data.length > 0 ? resRatings.data.reduce((sum, r) => sum + r.rating, 0) / resRatings.data.length : 0;
        setAvgRating(avg);
        // Get products for this store
        const resProducts = await axios.get(`http://localhost:5000/api/products/store/${ownedStore.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(resProducts.data);
      }
    } catch {
      setStore(null);
      setRatings([]);
      setAvgRating(0);
      setProducts([]);
    }
  };

  return (
    <Box mt={4}>
      <Typography variant="h4" gutterBottom>Store Owner Dashboard</Typography>
      {store ? (
        <>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6">Store: {store.name}</Typography>
            <Typography>Email: {store.email}</Typography>
            <Typography>Address: {store.address}</Typography>
            <Typography>Average Rating: {avgRating.toFixed(2)}</Typography>
          </Paper>
          <OwnerAddProduct token={token} storeId={store.id} onProductAdded={fetchStoreAndRatings} />
          <Typography variant="h6" mt={2}>Products</Typography>
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
          <Typography variant="h6" mt={2}>Users Who Rated Your Store</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Rating</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ratings.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.email}</TableCell>
                    <TableCell>{r.rating}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : (
        <>
          <Typography>No store found for this owner.</Typography>
          <OwnerAddStore token={token} user={user} onStoreAdded={fetchStoreAndRatings} />
        </>
      )}
    </Box>
  );
}
