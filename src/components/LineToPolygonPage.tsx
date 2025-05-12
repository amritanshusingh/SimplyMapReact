import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { DeckGL } from "@deck.gl/react";
import { GeoJsonLayer } from "@deck.gl/layers";
import type { MapViewState } from "@deck.gl/core";
import { Box, Typography, Grid, Card, Button } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { kml } from "@tmcw/togeojson";
import { DOMParser } from "@xmldom/xmldom";
import { useTheme } from "@mui/material/styles";
import { darkModeMapStyles } from "../theme/mapStyles";

const LineToPolygonPage: React.FC = () => {
  const theme = useTheme();
  const isDarkTheme = theme.palette.mode === "dark";
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [showMap, setShowMap] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const googleAPIkey = import.meta.env.VITE_GOOGLE_API_KEY;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFileName(file.name);
      // Placeholder for line-to-polygon conversion logic
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = reader.result as string;
          const parser = new DOMParser();
          const kmlDocument = parser.parseFromString(text, "application/xml");
          const geoJson = kml(kmlDocument);
          setGeoJsonData(geoJson);
        } catch (error) {
          console.error("Error processing the KML file:", error);
        }
      };
      reader.readAsText(file);
    }
  }, []);

  const handleProcessFile = () => {
    if (geoJsonData) {
      setShowMap(true);
    } else {
      console.error("No GeoJSON data available to render the map.");
    }
  };

  const INITIAL_VIEW_STATE: MapViewState = {
    latitude: 25.5428,
    longitude: 77.3578,
    zoom: 15,
    minZoom: 2,
    maxZoom: 15,
  };

  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);

  useEffect(() => {
    if (
      geoJsonData &&
      geoJsonData.features &&
      geoJsonData.features.length > 0
    ) {
      const coordinates = geoJsonData.features.flatMap((feature: any) => {
        if (feature.geometry.type === "LineString") {
          return feature.geometry.coordinates;
        }
        return [];
      });

      if (coordinates.length > 0) {
        const lats = coordinates.map((coord: [number, number]) => coord[1]);
        const lngs = coordinates.map((coord: [number, number]) => coord[0]);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        setViewState({
          latitude: (minLat + maxLat) / 2,
          longitude: (minLng + maxLng) / 2,
          zoom: Math.max(
            2,
            Math.min(
              15,
              Math.floor(
                8 - Math.log2(Math.max(maxLat - minLat, maxLng - minLng))
              )
            )
          ),
          minZoom: 2,
          maxZoom: 15,
        });
      }
    }
  }, [geoJsonData]);

  const layers = geoJsonData
    ? [
        new GeoJsonLayer({
          id: "geojson-layer",
          data: geoJsonData,
          pickable: true,
          stroked: true,
          filled: true,
          lineWidthScale: 10,
          lineWidthMinPixels: 2,
          getFillColor: [160, 160, 180, 200],
          getLineColor: [255, 100, 100],
          getRadius: 50,
          getLineWidth: 1,
          getElevation: 30,
        }),
      ]
    : [];

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <Grid
      container
      spacing={2}
      justifyContent="center"
      alignItems="center"
      direction="column"
      sx={{ padding: "20px" }}
    >
      {!showMap ? (
        <>
          <Grid sx={{ width: "100%" }}>
            <Grid
              container
              spacing={2}
              direction="row"
              justifyContent="center"
              alignItems="center"
            >
              <Grid>
                <Box
                  sx={{
                    border: "2px dashed",
                    borderColor: "grey.400",
                    borderRadius: "8px",
                    height: "200px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
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
                    border: "2px dashed",
                    borderColor: "primary.main",
                    borderRadius: "8px",
                    padding: "20px",
                    textAlign: "center",
                    cursor: "pointer",
                    backgroundColor: isDragActive
                      ? "rgba(0, 0, 0, 0.1)"
                      : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <input {...getInputProps()} />
                  <Typography variant="h6" color="text.secondary">
                    {selectedFileName
                      ? `Selected file: ${selectedFileName}`
                      : isDragActive
                      ? "Drop the files here..."
                      : "Drag & drop files here, or click to select files"}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>
          <Grid sx={{ marginTop: "20px" }}>
            <Button
              onClick={handleProcessFile}
              variant="contained"
              color="primary"
              sx={{ padding: "10px 20px", fontSize: "16px" }}
            >
              Convert to Polygon KML
            </Button>
          </Grid>
        </>
      ) : (
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
                    layers={layers}
                    pickingRadius={5}
                    initialViewState={viewState}
                    controller={true}
                  >
                    <Map
                      mapTypeId="terrain"
                      styles={isDarkTheme ? darkModeMapStyles : undefined}
                    />
                  </DeckGL>
                </APIProvider>
                <Button
                  variant="contained"
                  color="secondary"
                  sx={{
                    position: "absolute",
                    top: "16px",
                    right: "16px",
                    backdropFilter: "blur(8px)",
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  onClick={() => {
                    const trimmedPolygonKML =
                      localStorage.getItem("trimmedPolygonKML");
                    if (trimmedPolygonKML) {
                      const blob = new Blob([trimmedPolygonKML], {
                        type: "application/vnd.google-earth.kml+xml",
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "polygon-data.kml";
                      a.click();
                      URL.revokeObjectURL(url);
                    } else {
                      console.error("No KML data available to download.");
                    }
                  }}
                >
                  <FileDownloadIcon />
                  Download Polygon Data KML
                </Button>
              </div>
            </Card>
          </Box>
        </Grid>
      )}
    </Grid>
  );
};

export default LineToPolygonPage;
