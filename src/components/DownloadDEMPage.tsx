import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { DeckGL } from "@deck.gl/react";
import { GeoJsonLayer } from "@deck.gl/layers";
import { Box, Typography, Grid, Card } from "@mui/material";
import { kml } from "@tmcw/togeojson";
import { DOMParser } from "@xmldom/xmldom";
import { useTheme } from "@mui/material/styles";
import { darkModeMapStyles } from "../theme/mapStyles";

class ErrorBoundary extends React.Component<{ children: React.ReactNode }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <Typography>Error loading the map. Please try again.</Typography>;
    }
    return this.props.children;
  }
}

const MemoizedDeckGL = React.memo(DeckGL);

const DownloadDEMPage: React.FC = () => {
  const theme = useTheme();
  const isDarkTheme = theme.palette.mode === "dark";
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [showMap, setShowMap] = useState(false);
  const [initialViewState, setInitialViewState] = useState({
    latitude: 25.5428,
    longitude: 77.3578,
    zoom: 15,
    minZoom: 2,
    maxZoom: 15,
  });
  const googleAPIkey = import.meta.env.VITE_GOOGLE_API_KEY;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === "application/vnd.google-earth.kml+xml") {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        const parser = new DOMParser();
        const kmlDocument = parser.parseFromString(text, "application/xml");
        const geoJson = kml(kmlDocument);
        //console.log("GeoJSON Data:", geoJson);
        setGeoJsonData(geoJson);
        setShowMap(true);
      };
      reader.readAsText(file);
    } else {
      console.error("Invalid file type. Please upload a valid KML file.");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  useEffect(() => {
    if (geoJsonData && geoJsonData.features.length > 0) {
      const coordinates = geoJsonData.features[0].geometry.coordinates;
      let latitude, longitude;
      [longitude, latitude] = coordinates[0][0];
      console.log("Latitude:", latitude);
      console.log("Longitude:", longitude);

      // Validate latitude and longitude
      if (
        typeof latitude === "number" &&
        typeof longitude === "number" &&
        isFinite(latitude) &&
        isFinite(longitude)
      ) {
        setInitialViewState((prevState) => {
          if (
            prevState.latitude !== latitude ||
            prevState.longitude !== longitude
          ) {
            return {
              ...prevState,
              latitude,
              longitude,
            };
          }
          return prevState; // Avoid unnecessary updates
        });
      } else {
        console.error(
          "Invalid latitude or longitude values. Falling back to default coordinates."
        );
      }
    }
  }, [geoJsonData]);

  const memoizedGeoJsonLayer = React.useMemo(() => {
    if (
      !geoJsonData ||
      !geoJsonData.features ||
      geoJsonData.features.length === 0
    ) {
      console.log("Skipping GeoJsonLayer creation due to invalid geoJsonData");
      return null;
    }
    console.log("Creating GeoJsonLayer"); // Debugging log to track layer creation
    return new GeoJsonLayer({
      id: "geojson-layer",
      data: geoJsonData,
      filled: true,
      stroked: true, // Ensure polygon outlines are visible
      lineWidthMinPixels: 2, // Set minimum line width for better visibility
      getFillColor: [255, 0, 0, 128], // Semi-transparent red fill
      getLineColor: [0, 0, 0, 255], // Black outline
      pickable: true, // Enable picking for debugging
    });
  }, [geoJsonData]);

  const memoizedDeckGL = React.useMemo(() => {
    if (!memoizedGeoJsonLayer) {
      console.log("Skipping DeckGL rendering due to missing GeoJsonLayer");
      return null;
    }
    console.log("Rendering DeckGL component"); // Debugging log to track DeckGL rendering
    return (
      <MemoizedDeckGL
        initialViewState={initialViewState}
        controller={true}
        layers={[memoizedGeoJsonLayer]}
      >
        <ErrorBoundary>
          <Map
            mapTypeId="terrain"
            defaultZoom={initialViewState.zoom}
            defaultCenter={
              isFinite(initialViewState.latitude) &&
              isFinite(initialViewState.longitude)
                ? {
                    lat: initialViewState.latitude,
                    lng: initialViewState.longitude,
                  }
                : { lat: 25.5428, lng: 77.3578 } // Fallback to default coordinates
            }
            styles={isDarkTheme ? darkModeMapStyles : undefined}
          />
        </ErrorBoundary>
      </MemoizedDeckGL>
    );
  }, [initialViewState, memoizedGeoJsonLayer, isDarkTheme]);

  return (
    <Grid container spacing={2} justifyContent="center" alignItems="center">
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
      {showMap &&
        geoJsonData &&
        geoJsonData.features &&
        geoJsonData.features.length > 0 && (
          <Grid>
            <Box sx={{ height: "500px", width: "100%" }}>
              <APIProvider apiKey={googleAPIkey}>{memoizedDeckGL}</APIProvider>
            </Box>
          </Grid>
        )}
    </Grid>
  );
};

export default DownloadDEMPage;
