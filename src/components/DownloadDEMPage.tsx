import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, Box, Typography, Grid } from "@mui/material";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { useTheme } from "@mui/material/styles"; // Import useTheme to access the current theme
import { darkModeMapStyles } from "../theme/mapStyles"; // Import dark mode map styles
import { DeckGL } from "@deck.gl/react";
import type { MapViewState } from "@deck.gl/core";

const DownloadDEMPage: React.FC = () => {
  const [showMap, setShowMap] = React.useState(false);
  const [fileUploaded, setFileUploaded] = React.useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Handle file upload logic here
    console.log("File(s) dropped:", acceptedFiles);
    if (acceptedFiles && acceptedFiles.length > 0) {
      setFileUploaded(true);
      setShowMap(true);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  const googleAPIkey = import.meta.env.VITE_GOOGLE_API_KEY;
  const theme = useTheme(); // Access the current theme
  const isDarkTheme = theme.palette.mode === "dark"; // Determine if the theme is dark
  const INITIAL_VIEW_STATE: MapViewState = {
    latitude: 25.5428, // Centered between the two points
    longitude: 77.3578, // Centered between the two points
    zoom: 15,
    minZoom: 2,
    maxZoom: 15,
  };

  return (
    <Grid
      container
      spacing={2}
      justifyContent="center"
      alignItems="center"
      direction="column"
      sx={{ padding: "20px" }}
    >
      {!fileUploaded && (
        <Grid>
          <Card sx={{ padding: "16px", marginTop: "16px" }}>
            <Typography variant="h5" gutterBottom>
              Upload Polygon KML to Download DEM
            </Typography>
            <div
              {...getRootProps()}
              style={{
                border: "2px dashed gray",
                padding: "16px",
                textAlign: "center",
                cursor: "pointer",
                backgroundColor: isDragActive ? "#f0f0f0" : "transparent",
              }}
            >
              <input {...getInputProps()} />
              <Typography>
                {isDragActive
                  ? "Drop the file here..."
                  : "Drag and drop your KML file here, or click to upload"}
              </Typography>
            </div>
          </Card>
        </Grid>
      )}
      {showMap && (
        <Grid sx={{ width: "100%" }}>
          <Box sx={{ height: "100vh", width: "100%" }}>
            <Card
              sx={{
                height: "calc(100vh - 96px)",
                width: "100%",
                padding: "16px",
                marginTop: "64px",
              }}
            >
              <div
                style={{ position: "relative", height: "100%", width: "100%" }}
              >
                <APIProvider apiKey={googleAPIkey}>
                  <DeckGL
                    pickingRadius={5}
                    initialViewState={INITIAL_VIEW_STATE}
                    controller={true}
                  >
                    <Map
                      mapTypeId="terrain"
                      styles={isDarkTheme ? darkModeMapStyles : undefined}
                    />
                  </DeckGL>
                </APIProvider>
              </div>
            </Card>
          </Box>
        </Grid>
      )}
    </Grid>
  );
};

export default DownloadDEMPage;
