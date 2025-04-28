import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography } from '@mui/material';

const PointToLinePage: React.FC = () => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log('Uploaded files:', acceptedFiles);
    // Handle file processing here
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
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
  );
};

export default PointToLinePage;