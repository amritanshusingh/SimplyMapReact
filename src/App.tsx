import { AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItemButton, ListItemText, Box, Button, useTheme, useMediaQuery, Grid, Card, CardContent, CssBaseline, Switch } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import TerrainIcon from '@mui/icons-material/TerrainTwoTone';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/InsightsTwoTone';
import InfoIcon from '@mui/icons-material/Info';
import TripOriginIcon from '@mui/icons-material/TripOriginTwoTone';
import ContactsIcon from '@mui/icons-material/Contacts';
import ArrowBackIcon from '@mui/icons-material/ArrowBackTwoTone';
import JoinInnerIcon from '@mui/icons-material/JoinInnerTwoTone';
import JoinFullIcon from '@mui/icons-material/JoinFullTwoTone';
import TollTwoToneIcon from '@mui/icons-material/TollTwoTone';
import ControlPointDuplicateRoundedIcon from '@mui/icons-material/ControlPointDuplicateRounded';
import { useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import themeConfig from './theme';

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: isDarkMode ? themeConfig.dark.primary : themeConfig.light.primary,
      },
      secondary: {
        main: isDarkMode ? themeConfig.dark.secondary : themeConfig.light.secondary,
      },
      background: {
        default: isDarkMode ? themeConfig.dark.background : themeConfig.light.background,
      },
    },
  });

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleModeChange = () => {
    setIsDarkMode(!isDarkMode);
  };

  const drawerContent = (
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
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(109, 188, 123, 0.6)' }}>
        <Toolbar>
          <TerrainIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Simply Map
          </Typography>
          <Switch checked={isDarkMode} onChange={handleModeChange} sx={{ mr: 2 }} />
          {useMediaQuery(theme.breakpoints.down('sm')) ? (
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
                <Button
                  key={text}
                  color="inherit"
                  startIcon={
                    text === 'Home' ? <HomeIcon /> :
                    text === 'About' ? <InfoIcon /> :
                    text === 'Contact' ? <ContactsIcon /> : undefined
                  }
                >
                  {text}
                </Button>
              ))}
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawerContent}
      </Drawer>
      <Box sx={{ p: 3, mt: 8, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', minHeight: 'calc(100vh - 64px)', alignItems: 'center' }}>
        <Grid
          container
          spacing={2}
          columns={12}
          justifyContent="center"
          component="div"
        >
          {Array.from({ length: 8 }).map((_, index) => (
            <Grid
              component="div"
              xs={12}
              sm={6}
              md={4}
              lg={3}
              key={index}
              sx={{ display: 'flex', flexDirection: 'column' }}
            >
              <Card sx={{ transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)' }, maxWidth: 300 }}>
                {index === 0 ? (
                  <CardContent>
                    <InsightsIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h5" component="div">
                      Point to Line (KML)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Get a Line KML file by converting your Points KML File
                    </Typography>
                  </CardContent>
                ) : index === 1 ? (
                  <CardContent>
                    <TripOriginIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h5" component="div">
                      Buffer
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Create a desired buffer around your polygon kml files
                    </Typography>
                  </CardContent>
                ) : index === 2 ? (
                  <CardContent>
                    <JoinInnerIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h5" component="div">
                      Intersection
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Perform intersection on two polygons
                    </Typography>
                  </CardContent>
                ) : index === 3 ? (
                  <CardContent>
                    <JoinFullIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h5" component="div">
                      Union
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Perform Join Operation on two polygons
                    </Typography>
                  </CardContent>
                ) : index === 4 ? (
                  <CardContent>
                    <TollTwoToneIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h5" component="div">
                      Subtract Feature (Minus)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Subtract one polygon from another polygon. Resultant will be what remains of the first polygon.If polygons don't overlap, first polygon will be the result as it is.
                    </Typography>
                  </CardContent>
                ) : index === 5 ? (
                  <CardContent>
                    <ControlPointDuplicateRoundedIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h5" component="div">
                      Add Polygons
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Add two polygons. Different from union, it adds two polygons even if they don't intersect each other. Resultant is a single shapefile/kml file containing both polygons.
                    </Typography>
                  </CardContent>
                ) : (
                  <CardContent>
                    <Typography variant="h5" component="div">
                      Card {index + 1}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      This is some dummy content for card {index + 1}.
                    </Typography>
                  </CardContent>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </ThemeProvider>
  );
}

export default App;
