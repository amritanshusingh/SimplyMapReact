import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  APIProvider,
  Map,
  MapCameraChangedEvent,
} from "@vis.gl/react-google-maps";
import { DeckGL } from "@deck.gl/react";
import { GeoJsonLayer } from "@deck.gl/layers";
import type { Color, PickingInfo, MapViewState } from "@deck.gl/core";
import { Box, Typography, Grid, Card, Button } from "@mui/material";
import { kml } from "@tmcw/togeojson";
import { DOMParser } from "@xmldom/xmldom";
import { relative } from "path";

const PointToLinePage: React.FC = () => {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [showMap, setShowMap] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const googleAPIkey = import.meta.env.VITE_GOOGLE_API_KEY;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFileName(file.name); // Set the selected file name
      if (file.type === "application/vnd.google-earth.kml+xml") {
        const reader = new FileReader();
        reader.onload = () => {
          const text = reader.result as string;
          const parser = new DOMParser();
          const kmlDocument = parser.parseFromString(text, "application/xml");
          const geoJson = kml(kmlDocument);
          setGeoJsonData(geoJson);
        };
        reader.readAsText(file);
      } else {
        console.error("Invalid file type. Please upload a KML file.");
      }
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
    latitude: 25.5428, // Centered between the two points
    longitude: 77.3578, // Centered between the two points
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
        if (feature.geometry.type === "Point") {
          return [feature.geometry.coordinates];
        } else if (feature.geometry.type === "LineString") {
          return feature.geometry.coordinates;
        } else if (feature.geometry.type === "Polygon") {
          return feature.geometry.coordinates.flat();
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
          lineWidthScale: 20,
          lineWidthMinPixels: 2,
          getFillColor: [160, 160, 180, 200],
          getLineColor: [255, 100, 100],
          getRadius: 100,
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
              Convert to Line KML
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
                style={{ position: "relative", height: "100%", width: "100%" }} // Added styles to ensure proper containment
              >
                <APIProvider apiKey={googleAPIkey}>
                  <DeckGL
                    layers={layers}
                    pickingRadius={5}
                    initialViewState={viewState}
                    controller={true}
                  >
                    <Map style={{ width: "100%", height: "100%" }} />
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

export default PointToLinePage;
