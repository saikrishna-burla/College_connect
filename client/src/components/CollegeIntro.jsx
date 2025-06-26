// src/components/CollegeIntro.jsx
import React from 'react';
import { Typography, Paper } from '@mui/material';

const CollegeIntro = ({ user }) => {
  if (!user) return null;

  return (
    <Paper sx={{ padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        Welcome to {user.college}
      </Typography>
      <Typography variant="body1">
        This is the main discussion platform for all juniors and seniors of {user.college}. 
        Use the sidebar to explore categories and ask or answer questions!
      </Typography>
    </Paper>
  );
};

export default CollegeIntro;
