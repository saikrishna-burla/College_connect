import React, { useState,useEffect } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Alert,
  Collapse,
} from '@mui/material';
import '../styles/SignUp.css';
import { Autocomplete } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';


const collegeOptions = [ 'IIEST',
  'IIT Bombay', 'IIT Delhi', 'IIT Madras', 'IIT Kanpur', 'IIT Kharagpur',
  'IIT Roorkee', 'IIT Guwahati', 'IIT Hyderabad', 'IIT BHU', 'IIT Dhanbad',
  'NIT Trichy', 'NIT Surathkal', 'NIT Warangal', 'NIT Rourkela', 'NIT Calicut',
  'NIT Durgapur', 'NIT Allahabad', 'NIT Jaipur', 'NIT Nagpur', 'NIT Kurukshetra'
];

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    college: '',
    role: '',
  });
  


  const [alert, setAlert] = useState({ msg: '', severity: 'success' });
  const [showAlert, setShowAlert] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password, role, college } = formData;

    if (!name || !email || !password || !role || !college) {
      showAlertMessage('Please fill out all fields', 'warning');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlertMessage('Please enter a valid email address', 'warning');
      return;
    }

    if (password.length < 6) {
      showAlertMessage('Password must be at least 6 characters', 'warning');
      return;
    }

    try {
      const res = await axios.post('https://college-connect-98vs.onrender.com/api/auth/signup', formData);
     const { user, token } = res.data;
 localStorage.setItem('user', JSON.stringify(user));
 localStorage.setItem('token', token);


      showAlertMessage('Signup successful!', 'success');
      setTimeout(() => navigate('/Dashboard'), 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Signup failed';
      showAlertMessage(errorMsg, 'error');
    }
  };

  const showAlertMessage = (msg, severity = 'info') => {
    setAlert({ msg, severity });
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  return (
    <Box className="signup-container">
      <Paper elevation={3} className="signup-box">
        <Typography variant="h5" gutterBottom>
          Signup for CampusConnect
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField label="Name" name="name" fullWidth margin="normal" required onChange={handleChange} />
          <TextField label="Email" name="email" fullWidth margin="normal" required onChange={handleChange} />
          <TextField
            label="Password"
            name="password"
            type="password"
            fullWidth
            margin="normal"
            required
            onChange={handleChange}
          />

          <Autocomplete
            options={collegeOptions}
            value={formData.college}
            onChange={(event, newValue) => {
              setFormData({ ...formData, college: newValue });
            }}
            renderInput={(params) => (
              <TextField {...params} label="College" margin="normal" fullWidth required />
            )}
            freeSolo
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <MenuItem value="junior">Junior</MenuItem>
              <MenuItem value="senior">Senior</MenuItem>
            </Select>
          </FormControl>

          <Button type="submit" variant="contained" color="primary" fullWidth className="signup-button">
            Sign Up
          </Button>
        </form>
        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
  Already have an account? <Link to="/">Login</Link>
         </Typography>


        {/* Styled Alert */}
        <Collapse in={showAlert}>
          <Alert severity={alert.severity} sx={{ mt: 2 }}>
            {alert.msg}
          </Alert>
        </Collapse>
      </Paper>
    </Box>
  );
};

export default Signup;
