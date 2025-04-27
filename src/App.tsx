import { AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItemButton, ListItemText, Box, Button, useTheme, useMediaQuery, Grid, Card, CardContent } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const drawerContent = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {['Home', 'About', 'Contact'].map((text) => (
          <ListItemButton key={text}>
            <ListItemText primary={text} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Responsive App Bar
          </Typography>
          {isSmallScreen ? (
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
                <Button key={text} color="inherit">
                  {text}
                </Button>
              ))}
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawerContent}
      </Drawer>
      <Box sx={{ p: 3, mt: 8 }}>
        <Grid container spacing={2} columns={12}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index} sx={{ display: 'flex', flexDirection: 'column' }}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="div">
                    Card {index + 1}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This is some dummy content for card {index + 1}.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
}

export default App;
