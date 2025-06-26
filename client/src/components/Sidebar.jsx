import React from 'react';
import {
  Drawer,
  List,
  ListItemText,
  Typography,
  Box,
  ListItemButton,
} from '@mui/material';

// Define emojis per category
const categoryEmojis = {
  "General": "💬",
  "Placement": "🎯",
  "Academics": "📚",
  "Events": "📅",
  "Clubs": "🎉",
  "Hostel": "🏠",
  "Sports": "⚽",
  "Tech": "💻",
  "Help": "🆘",
  "Lost & Found": "🔍",
  // Add more as needed
};

const Sidebar = ({ categories, onSelect }) => {
  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: 240,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: 240,
          boxSizing: 'border-box',
          backgroundColor: '#e8f5e9',
          paddingTop: '1rem',
          borderRight: '2px solid #a5d6a7',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Categories
        </Typography>

        <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {categories.map((category) => {
            const emoji = categoryEmojis[category] || '📌';

            return (
              <ListItemButton
                key={category}
                onClick={() => onSelect(category)}
                sx={{
                  borderRadius: 2,
                  backgroundColor: '#ffffff',
                  border: '1px solid #c8e6c9',
                  position: 'relative',
                  overflow: 'hidden',
                  padding: 2,
                  minHeight: '60px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#c8e6c9',
                    borderColor: '#81c784',
                  },
                  '&::before': {
                    content: `"${emoji}"`,
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '1.5rem',
                    opacity: 0.3,
                  },
                }}
              >
                <ListItemText
                  primary={category}
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
