import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, Box, Typography, Grid } from "@mui/material";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { useTheme } from "@mui/material/styles"; // Import useTheme to access the current theme
import { darkModeMapStyles } from "../theme/mapStyles"; // Import dark mode map styles
import { DeckGL } from "@deck.gl/react";
import type { MapViewState } from "@deck.gl/core";
import { kml } from "@tmcw/togeojson";
import { DOMParser } from "@xmldom/xmldom";
import { GeoJsonLayer } from "@deck.gl/layers";
import bbox from "@turf/bbox";

const INITIAL_VIEW_STATE: MapViewState = {
  latitude: 25.5428, // Centered between the two points
  longitude: 77.3578, // Centered between the two points
  zoom: 15,
  minZoom: 2,
  maxZoom: 15,
};

const DownloadDEMPage: React.FC = () => {
  const [showMap, setShowMap] = React.useState(false);
  const [fileUploaded, setFileUploaded] = React.useState(false);
  const [geoJsonData, setGeoJsonData] = React.useState<any>(null);
  const [viewState, setViewState] = React.useState(INITIAL_VIEW_STATE);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        const parser = new DOMParser();
        const kmlDocument = parser.parseFromString(text, "application/xml");
        const geoJson = kml(kmlDocument);
        setGeoJsonData(geoJson);
        setFileUploaded(true);
        setShowMap(true);
      };
      reader.readAsText(file);
    }
  }, []);

  React.useEffect(() => {
    if (
      geoJsonData &&
      geoJsonData.features &&
      geoJsonData.features.length > 0
    ) {
      try {
        const [minLng, minLat, maxLng, maxLat] = bbox(geoJsonData);
        const latitude = (minLat + maxLat) / 2;
        const longitude = (minLng + maxLng) / 2;
        // Calculate zoom based on bounds (simple heuristic)
        const latDiff = Math.abs(maxLat - minLat);
        const lngDiff = Math.abs(maxLng - minLng);
        let zoom = 8;
        if (latDiff < 0.01 && lngDiff < 0.01) zoom = 15;
        else if (latDiff < 0.1 && lngDiff < 0.1) zoom = 13;
        else if (latDiff < 1 && lngDiff < 1) zoom = 10;
        else if (latDiff < 5 && lngDiff < 5) zoom = 8;
        else zoom = 5;
        setViewState({
          latitude,
          longitude,
          zoom,
          minZoom: 2,
          maxZoom: 15,
        });
      } catch (e) {
        // fallback to default view state
        setViewState(INITIAL_VIEW_STATE);
      }
    }
  }, [geoJsonData]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  const googleAPIkey = import.meta.env.VITE_GOOGLE_API_KEY;
  const theme = useTheme(); // Access the current theme
  const isDarkTheme = theme.palette.mode === "dark"; // Determine if the theme is dark

  const layer = React.useMemo(() => {
    if (!geoJsonData) return null;
    return new GeoJsonLayer({
      id: "layer",
      data: geoJsonData,
      filled: true,
      stroked: true,
      lineWidthMinPixels: 2,
      getFillColor: [0, 128, 255, 120], // blue-ish fill
      getLineColor: [0, 0, 0, 255], // black outline
      pickable: true,
    });
  }, [geoJsonData]);

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
                    initialViewState={viewState}
                    viewState={viewState}
                    controller={true}
                    layers={layer ? [layer] : []}
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
