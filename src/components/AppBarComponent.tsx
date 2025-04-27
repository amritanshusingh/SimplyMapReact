import { AppBar, Toolbar, IconButton, Typography, Switch, Box, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import TerrainIcon from '@mui/icons-material/TerrainTwoTone';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import ContactsIcon from '@mui/icons-material/Contacts';
import React from 'react';

interface AppBarProps {
  isDarkMode: boolean;
  handleModeChange: () => void;
  toggleDrawer: (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => void;
}

const AppBarComponent: React.FC<AppBarProps> = ({ isDarkMode, handleModeChange, toggleDrawer }) => {
  const theme = useMediaQuery('(max-width:600px)');

  return (
    <AppBar position="fixed" sx={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(109, 188, 123, 0.6)' }}>
      <Toolbar>
        <TerrainIcon sx={{ mr: 1 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Simply Map
        </Typography>
        <Switch checked={isDarkMode} onChange={handleModeChange} sx={{ mr: 2 }} />
        {theme ? (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            {['Home', 'About', 'Contact'].map((text) => (
              <Typography
                key={text}
                color="inherit"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  transition: 'background-color 0.3s',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  },
                }}
              >
                {text === 'Home' ? <HomeIcon /> :
                 text === 'About' ? <InfoIcon /> :
                 text === 'Contact' ? <ContactsIcon /> : null}
                {text}
              </Typography>
            ))}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default AppBarComponent;