import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Grid } from '@mui/material';

const PointToLinePage: React.FC = () => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log('Uploaded files:', acceptedFiles);
    // Handle file processing here
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <Grid container spacing={2} justifyContent="center" alignItems="center">
      <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
        <Grid container sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box
            sx={{
              border: '2px dashed',
              borderColor: 'grey.400',
              borderRadius: '8px',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Image Placeholder
            </Typography>
          </Box>
        </Grid>
      </Grid>
      <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
        <Grid container sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: 'primary.main',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: isDragActive ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
            }}
          >
            <input {...getInputProps()} />
            <Typography variant="h6" color="text.secondary">
              {isDragActive ? 'Drop the files here...' : 'Drag & drop files here, or click to select files'}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default PointToLinePage;