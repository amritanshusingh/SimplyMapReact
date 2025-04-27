import { Drawer, Box, List, ListItemButton, ListItemText } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBackTwoTone';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import ContactsIcon from '@mui/icons-material/Contacts';
import React from 'react';

interface DrawerProps {
  drawerOpen: boolean;
  toggleDrawer: (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => void;
}

const DrawerComponent: React.FC<DrawerProps> = ({ drawerOpen, toggleDrawer }) => {
  return (
    <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
      <Box
        sx={{ width: 250 }}
        role="presentation"
        onClick={toggleDrawer(false)}
        onKeyDown={toggleDrawer(false)}
      >
        <ListItemButton onClick={toggleDrawer(false)} sx={{ backgroundColor: 'rgba(0, 0, 0, 0.1)', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.2)' } }}>
          <ArrowBackIcon sx={{ mr: 2 }} />
          <ListItemText primary="Back" />
        </ListItemButton>
        <List>
          {['Home', 'About', 'Contact'].map((text) => (
            <ListItemButton key={text}>
              {text === 'Home' ? <HomeIcon sx={{ mr: 2 }} /> :
               text === 'About' ? <InfoIcon sx={{ mr: 2 }} /> :
               text === 'Contact' ? <ContactsIcon sx={{ mr: 2 }} /> : null}
              <ListItemText primary={text} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default DrawerComponent;