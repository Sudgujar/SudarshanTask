import { ThemeProvider, CssBaseline, Container, Box, Typography, Button } from '@mui/material';
import theme from './theme';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SignupForm from './SignupForm';
import StoreList from './StoreList';
import AdminDashboard from './AdminDashboard';
import OwnerDashboard from './OwnerDashboard';
import UpdatePassword from './UpdatePassword';

function Home() {
  return (
    <Box textAlign="center" mt={8}>
      <Typography variant="h3" color="primary" gutterBottom>
        Store Rating Platform
      </Typography>
      <Typography variant="h6" color="textSecondary" gutterBottom>
        Welcome! Please login or sign up to continue.
      </Typography>
      <Box mt={4}>
        <Link to="/login">Login</Link> | <Link to="/signup">Sign Up</Link>
      </Box>
    </Box>
  );
}

import LoginForm from './LoginForm';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
  return (
    <Box textAlign="center" mt={8}>
      <LoginForm onLogin={onLogin} />
    </Box>
  );
}

function Signup() {
  return (
    <Box textAlign="center" mt={8}>
      <SignupForm />
    </Box>
  );
}

function AppContent() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleLogin = (loginData) => {
    setToken(loginData.token);
    setUser(loginData.user);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    navigate('/');
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/stores" element={<StoreList token={token} />} />
        {user && user.role === 'admin' && (
          <Route path="/admin" element={<AdminDashboard token={token} />} />
        )}
        {user && user.role === 'owner' && (
          <Route path="/owner" element={<OwnerDashboard token={token} user={user} />} />
        )}
        {token && (
          <Route path="/update-password" element={<UpdatePassword token={token} />} />
        )}
      </Routes>
      {token && (
        <Box mt={2} textAlign="center">
          <Link to="/stores">View Stores</Link>
          {user && user.role === 'admin' && (
            <>
              {' | '}
              <Link to="/admin">Admin Dashboard</Link>
            </>
          )}
          {user && user.role === 'owner' && (
            <>
              {' | '}
              <Link to="/owner">Owner Dashboard</Link>
            </>
          )}
          {' | '}
          <Link to="/update-password">Update Password</Link>
          {' | '}
          <Button variant="outlined" color="secondary" size="small" onClick={handleLogout} sx={{ ml: 1 }}>Logout</Button>
        </Box>
      )}
    </>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md">
        <Router>
          <AppContent />
        </Router>
      </Container>
    </ThemeProvider>
  );
}

export default App;
