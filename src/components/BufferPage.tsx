import React from 'react';
import { Box, Typography } from '@mui/material';
import { Map } from '@vis.gl/react-google-maps';

const BufferPage: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100%',
        textAlign: 'center',
        margin: '0 auto',
        flexDirection: 'column',
      }}
    >
      <Typography
        variant="h4"
        color="text.primary"
        sx={{ textAlign: 'center', marginBottom: 2 }}
      >
        Buffer Landing Page
      </Typography>
      <Map
        defaultZoom={13}
        defaultCenter={{ lat: -33.860664, lng: 151.208138 }}
        onCameraChanged={(ev) =>
          console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom)
        }
        style={{ width: '100%', height: '80%' }}
      />
    </Box>
  );
};

export default BufferPage;