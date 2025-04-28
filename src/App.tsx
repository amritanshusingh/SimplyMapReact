import { CssBaseline } from '@mui/material';
import { Box } from '@mui/material';
import { useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import themeConfig from './theme';
import AppBarComponent from './components/AppBarComponent';
import DrawerComponent from './components/DrawerComponent';
import CardGridComponent from './components/CardGridComponent';
import { Routes, Route } from 'react-router-dom';
import PointToLinePage from './components/PointToLinePage';
import BufferPage from './components/BufferPage';

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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBarComponent
        isDarkMode={isDarkMode}
        handleModeChange={handleModeChange}
        toggleDrawer={toggleDrawer}
      />
      <DrawerComponent drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />
      <Routes>
        <Route path="/" element={
          <Box sx={{ p: 3, mt: 8, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', minHeight: 'calc(100vh - 64px)', alignItems: 'center' }}>
            <CardGridComponent />
          </Box>
        } />
        <Route path="/point-to-line-(kml)" element={<PointToLinePage />} />
        <Route path="/buffer" element={<BufferPage />} />
        {['Intersection', 'Union', 'Subtract Feature (Minus)', 'Add Polygons'].map((title) => (
          <Route key={title} path={`/${title.replace(/\s+/g, '-').toLowerCase()}`} element={<div>{title} Landing Page</div>} />
        ))}
      </Routes>
    </ThemeProvider>
  );
}

export default App;
