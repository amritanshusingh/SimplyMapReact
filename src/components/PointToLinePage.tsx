import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Grid, Card, Button } from '@mui/material';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import { kml } from '@tmcw/togeojson';
import { DOMParser } from '@xmldom/xmldom';
import L from 'leaflet';

const FitBoundsComponent = ({ geoJsonData }: { geoJsonData: any }) => {
  const map = useMap();

  useEffect(() => {
    if (geoJsonData) {
      const layer = L.geoJSON(geoJsonData);
      map.fitBounds(layer.getBounds());
    }
  }, [geoJsonData, map]);

  return null;
};

const PointToLinePage: React.FC = () => {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [showMap, setShowMap] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'application/vnd.google-earth.kml+xml') {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        const parser = new DOMParser();
        const kmlDocument = parser.parseFromString(text, 'application/xml');
        const geoJson = kml(kmlDocument);
        setGeoJsonData(geoJson);
      };
      reader.readAsText(file);
    } else {
      console.error('Invalid file type. Please upload a KML file.');
    }
  }, []);

  const handleProcessFile = () => {
    if (geoJsonData) {
      setShowMap(true);
    } else {
      console.error('No GeoJSON data available to render the map.');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <Grid container spacing={2} justifyContent="center" alignItems="center" direction="column" sx={{ padding: '20px' }}>
      {!showMap ? (
        <>
          <Grid sx={{ width: '100%' }}>
            <Grid container spacing={2} direction="row" justifyContent="center" alignItems="center">
              <Grid>
                <Box
                  sx={{
                    border: '2px dashed',
                    borderColor: 'grey.400',
                    borderRadius: '8px',
                    height: '200px',
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
              <Grid>
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
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
          <Grid sx={{ marginTop: '20px' }}>
            <Button
              onClick={handleProcessFile}
              variant="contained"
              color="primary"
              sx={{ padding: '10px 20px', fontSize: '16px' }}
            >
              Process File
            </Button>
          </Grid>
        </>
      ) : (
        <Grid sx={{ width: '100%' }}>
          <Box sx={{ height: '100vh', width: '100%' }}>
            <Card sx={{ height: 'calc(100vh - 64px)', width: '100%', padding: '16px', marginTop: '64px' }}>
              <MapContainer center={[0, 0]} zoom={2} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                />
                {geoJsonData && (
                  <>
                    <GeoJSON data={geoJsonData} />
                    <FitBoundsComponent geoJsonData={geoJsonData} />
                  </>
                )}
              </MapContainer>
            </Card>
          </Box>
        </Grid>
      )}
    </Grid>
  );
};

export default PointToLinePage;