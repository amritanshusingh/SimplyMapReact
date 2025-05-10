import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  APIProvider,
  Map,
  MapCameraChangedEvent,
} from "@vis.gl/react-google-maps";
import { Box, Typography, Grid, Card, Button } from "@mui/material";
import { kml } from "@tmcw/togeojson";
import { DOMParser } from "@xmldom/xmldom";

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
              <APIProvider apiKey={googleAPIkey}>
                <Map
                  defaultZoom={13}
                  defaultCenter={{
                    lat: 25.54196730756527,
                    lng: 77.36467900618521,
                  }}
                  onCameraChanged={(ev) =>
                    console.log(
                      "camera changed:",
                      ev.detail.center,
                      "zoom:",
                      ev.detail.zoom
                    )
                  }
                  style={{ width: "100%", height: "100%" }}
                />
              </APIProvider>
            </Card>
          </Box>
        </Grid>
      )}
    </Grid>
  );
};

export default PointToLinePage;
