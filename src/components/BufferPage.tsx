import React from 'react';
import { Box, Typography } from '@mui/material';

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
      }}
    >
      <Typography
        variant="h4"
        color="text.primary"
        sx={{ textAlign: 'center' }}
      >
        Buffer Landing Page
      </Typography>
    </Box>
  );
};

export default BufferPage;