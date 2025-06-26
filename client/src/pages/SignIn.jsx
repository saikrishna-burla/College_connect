import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Paper,
  Typography,
  Box,
  Snackbar,
  Alert,
} from '@mui/material';
import '../styles/auth.css';
import axios from 'axios';

const SignIn = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [alert, setAlert] = useState({ open: false, message: '', severity: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showAlert = (message, severity = 'info') => {
    setAlert({ open: true, message, severity });
  };

  const handleClose = () => {
    setAlert({ ...alert, open: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      showAlert('Please fill in both email and password', 'warning');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlert('Please enter a valid email address', 'warning');
      return;
    }

    try {
      const res = await axios.post('https://college-connect-98vs.onrender.com/api/auth/login', {
        email,
        password,
      });

      const { user, token } = res.data;
localStorage.setItem('user', JSON.stringify(user));
localStorage.setItem('token', token);

      showAlert('Login successful!', 'success');

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500); // wait before redirecting
    } catch (err) {
      showAlert(err.response?.data?.msg || 'Login failed', 'error');
    }
  };

  return (
    <Box className="auth-container">
      <Paper className="auth-box">
        <Typography variant="h5">Sign In</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            name="email"
            fullWidth
            margin="normal"
            onChange={handleChange}
          />
          <TextField
            label="Password"
            type="password"
            name="password"
            fullWidth
            margin="normal"
            onChange={handleChange}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Sign In
          </Button>
        </form>
        <Typography variant="body2" style={{ marginTop: '1rem' }}>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </Typography>
      </Paper>

      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={alert.severity} onClose={handleClose} variant="filled">
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SignIn;
