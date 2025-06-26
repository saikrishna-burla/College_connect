// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import CollegeIntro from '../components/CollegeIntro';
import DiscussionFeed from '../components/DiscussionFeed';
import { Box } from '@mui/material';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const storedToken = localStorage.getItem('token');
    setUser(storedUser);
    setToken(storedToken);
  }, []);

  const categories = ["General",'Hostel', 'Fees', 'Academics', 'Sports', 'Clubs',"Placement"];

  return (
    <div className="dashboard-bg">
      <div className="dashboard-overlay" />
      <div className="dashboard-content">
        <Sidebar categories={categories} onSelect={setSelectedCategory} />
        <Box sx={{ flexGrow: 1, p: 3, ml: '200px' }}>
          {!selectedCategory ? (
            <CollegeIntro user={user} />
          ) : (
            <DiscussionFeed category={selectedCategory} user={user} token={token} />
          )}
        </Box>
      </div>
    </div>
  );
};

export default Dashboard;
