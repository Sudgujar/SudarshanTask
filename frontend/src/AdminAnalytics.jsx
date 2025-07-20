import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Star as StarIcon,
  People as PeopleIcon,
  Store as StoreIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import axios from 'axios';

export default function AdminAnalytics({ token }) {
  const [analytics, setAnalytics] = useState({
    stats: { users: 0, stores: 0, ratings: 0 },
    recentUsers: [],
    topStores: [],
    recentRatings: [],
    userGrowth: [],
    ratingDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
  });
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const [statsRes, ratingsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/users/stats/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/ratings/all', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const ratings = ratingsRes.data;
      const ratingDistribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
      ratings.forEach(rating => {
        ratingDistribution[rating.rating]++;
      });

      setAnalytics({
        stats: statsRes.data.stats,
        recentUsers: statsRes.data.recentUsers,
        topStores: statsRes.data.topStores,
        recentRatings: ratings.slice(0, 10),
        ratingDistribution
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'success';
    if (rating >= 3) return 'warning';
    return 'error';
  };

  const getRatingPercentage = (count) => {
    const total = Object.values(analytics.ratingDistribution).reduce((sum, val) => sum + val, 0);
    return total > 0 ? ((count / total) * 100).toFixed(1) : 0;
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Analytics Dashboard</Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            label="Time Range"
          >
            <MenuItem value="7d">Last 7 Days</MenuItem>
            <MenuItem value="30d">Last 30 Days</MenuItem>
            <MenuItem value="90d">Last 90 Days</MenuItem>
            <MenuItem value="1y">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PeopleIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{analytics.stats.users}</Typography>
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
                  <Typography variant="h4">{analytics.stats.stores}</Typography>
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
                  <Typography variant="h4">{analytics.stats.ratings}</Typography>
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
                <AssessmentIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {analytics.stats.stores > 0 
                      ? (analytics.stats.ratings / analytics.stats.stores).toFixed(1)
                      : 0
                    }
                  </Typography>
                  <Typography variant="body2">Avg Ratings/Store</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Rating Distribution */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Rating Distribution</Typography>
            <List>
              {Object.entries(analytics.ratingDistribution).reverse().map(([rating, count]) => (
                <ListItem key={rating}>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center">
                        <Typography variant="body1" sx={{ mr: 1 }}>
                          {rating} ⭐
                        </Typography>
                        <Box sx={{ flexGrow: 1, mx: 2 }}>
                          <Box
                            sx={{
                              height: 8,
                              bgcolor: 'grey.200',
                              borderRadius: 1,
                              overflow: 'hidden'
                            }}
                          >
                            <Box
                              sx={{
                                height: '100%',
                                bgcolor: getRatingColor(parseInt(rating)),
                                width: `${getRatingPercentage(count)}%`
                              }}
                            />
                          </Box>
                        </Box>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Chip
                      label={`${count} (${getRatingPercentage(count)}%)`}
                      size="small"
                      color={getRatingColor(parseInt(rating))}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Top Rated Stores</Typography>
            <List dense>
              {analytics.topStores.map((store, index) => (
                <ListItem key={store.id}>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center">
                        <Typography variant="body2" sx={{ mr: 1, fontWeight: 'bold' }}>
                          #{index + 1}
                        </Typography>
                        <Typography variant="body1">{store.name}</Typography>
                      </Box>
                    }
                    secondary={`${store.email} • ${store.rating_count || 0} ratings`}
                  />
                  <ListItemSecondaryAction>
                    <Chip
                      label={`${Number(store.avg_rating || 0).toFixed(1)} ⭐`}
                      color={getRatingColor(store.avg_rating || 0)}
                      size="small"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Recent Users</Typography>
            <List dense>
              {analytics.recentUsers.map((user) => (
                <ListItem key={user.id}>
                  <ListItemText
                    primary={user.name}
                    secondary={`${user.email} • ${formatDate(user.created_at)}`}
                  />
                  <ListItemSecondaryAction>
                    <Chip
                      label={user.role}
                      color={user.role === 'admin' ? 'error' : user.role === 'owner' ? 'warning' : 'primary'}
                      size="small"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Recent Ratings</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Store</TableCell>
                    <TableCell>Rating</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analytics.recentRatings.map((rating) => (
                    <TableRow key={rating.id}>
                      <TableCell>{rating.store_name || 'Unknown Store'}</TableCell>
                      <TableCell>
                        <Chip
                          label={`${rating.rating} ⭐`}
                          color={getRatingColor(rating.rating)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(rating.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 