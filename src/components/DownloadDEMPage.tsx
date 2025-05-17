import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, Box, Typography, Grid } from "@mui/material";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { useTheme } from "@mui/material/styles";
import { darkModeMapStyles } from "../theme/mapStyles";
import { DeckGL } from "@deck.gl/react";
import type { MapViewState } from "@deck.gl/core";
import { kml } from "@tmcw/togeojson";
import { DOMParser } from "@xmldom/xmldom";
import { GeoJsonLayer, BitmapLayer } from "@deck.gl/layers";
import bbox from "@turf/bbox";
import { fromArrayBuffer } from "geotiff";
import DownloadIcon from "@mui/icons-material/Download";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import CloseIcon from "@mui/icons-material/Close";
import ReplayIcon from "@mui/icons-material/Replay";

const INITIAL_VIEW_STATE: MapViewState = {
  latitude: 25.5428,
  longitude: 77.3578,
  zoom: 15,
  minZoom: 2,
  maxZoom: 15,
};

const DownloadDEMPage: React.FC = () => {
  const [showMap, setShowMap] = React.useState(false);
  const [fileUploaded, setFileUploaded] = React.useState(false);
  const [geoJsonData, setGeoJsonData] = React.useState<any>(null);
  const [viewState, setViewState] = React.useState(INITIAL_VIEW_STATE);
  const [bitmapLayer, setBitmapLayer] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [retryKey, setRetryKey] = React.useState(0);

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

  // Helper to get the current DEM cache key
  function getDEMCacheKey() {
    if (
      geoJsonData &&
      geoJsonData.features &&
      geoJsonData.features.length > 0
    ) {
      const [west, south, east, north] = bbox(geoJsonData);
      return `dem_${south}_${north}_${west}_${east}`;
    }
    return null;
  }

  // Download handler
  const handleDownloadDEM = () => {
    const cacheKey = getDEMCacheKey();
    if (!cacheKey) return;
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return;
    // Convert base64 to Blob
    const binaryString = atob(cached);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: "image/tiff" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dem.tif";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  // Fetch DEM GeoTIFF from API when geoJsonData is available
  React.useEffect(() => {
    async function fetchDEMAndCreateBitmapLayer() {
      if (
        geoJsonData &&
        geoJsonData.features &&
        geoJsonData.features.length > 0
      ) {
        setLoading(true);
        setError(null);
        try {
          // Get bounding box from polygon
          const [west, south, east, north] = bbox(geoJsonData);
          const apiKey = import.meta.env.VITE_OPENTOPO_API_KEY;
          const apiUrl = `https://portal.opentopography.org/API/globaldem?demtype=SRTMGL1&south=${south}&north=${north}&west=${west}&east=${east}&outputFormat=GTiff&API_Key=${apiKey}`;

          // Check localStorage for cached DEM
          const cacheKey = `dem_${south}_${north}_${west}_${east}`;
          let arrayBuffer: ArrayBuffer | null = null;
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            // Convert base64 to ArrayBuffer
            const binaryString = atob(cached);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            arrayBuffer = bytes.buffer;
          } else {
            // Fetch from API
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error("DEM API fetch failed");
            arrayBuffer = await response.arrayBuffer();
            // Store in localStorage as base64
            const bytes = new Uint8Array(arrayBuffer);
            let binary = "";
            for (let i = 0; i < bytes.byteLength; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            localStorage.setItem(cacheKey, btoa(binary));
          }

          // Parse GeoTIFF and create BitmapLayer
          const tiff = await fromArrayBuffer(arrayBuffer);
          const image = await tiff.getImage();
          const rasters = await image.readRasters({ interleave: true });
          const width = image.getWidth();
          const height = image.getHeight();
          const extent = image.getBoundingBox(); // [minX, minY, maxX, maxY]

          let imageData;
          if (
            ArrayBuffer.isView(rasters) &&
            (rasters as any).length === width * height * 4
          ) {
            imageData = new ImageData(
              new Uint8ClampedArray(rasters as ArrayLike<number>),
              width,
              height
            );
          } else if (
            Array.isArray(rasters) &&
            rasters.length === 4 &&
            rasters.every((band) => ArrayBuffer.isView(band))
          ) {
            const flat = new Uint8ClampedArray(width * height * 4);
            for (let i = 0; i < width * height; i++) {
              flat[i * 4 + 0] = rasters[0][i];
              flat[i * 4 + 1] = rasters[1][i];
              flat[i * 4 + 2] = rasters[2][i];
              flat[i * 4 + 3] = rasters[3][i];
            }
            imageData = new ImageData(flat, width, height);
          } else {
            imageData = new ImageData(width, height);
            for (let i = 0; i < width * height; i++) {
              let value: number;
              if (Array.isArray(rasters)) {
                value = rasters[0][i];
              } else {
                value = (rasters as any)[i];
              }
              imageData.data[i * 4 + 0] = value;
              imageData.data[i * 4 + 1] = value;
              imageData.data[i * 4 + 2] = value;
              imageData.data[i * 4 + 3] = 255;
            }
          }

          const bitmap = await createImageBitmap(imageData);

          setBitmapLayer(
            new BitmapLayer({
              id: "bitmap-layer",
              image: bitmap,
              bounds: [extent[0], extent[1], extent[2], extent[3]],
              opacity: 0.7,
            })
          );
          setError(null);
        } catch (error: any) {
          console.error("Error fetching DEM or creating BitmapLayer:", error);
          setBitmapLayer(null);
          setError(
            "Failed to download DEM. Please check your connection or try again."
          );
        } finally {
          setLoading(false);
        }
      }
    }
    fetchDEMAndCreateBitmapLayer();
  }, [geoJsonData, retryKey]);

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
        setViewState(INITIAL_VIEW_STATE);
      }
    }
  }, [geoJsonData]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  const googleAPIkey = import.meta.env.VITE_GOOGLE_API_KEY;
  const theme = useTheme();
  const isDarkTheme = theme.palette.mode === "dark";

  const layer = React.useMemo(() => {
    if (!geoJsonData) return null;
    return new GeoJsonLayer({
      id: "layer",
      data: geoJsonData,
      filled: true,
      stroked: true,
      lineWidthMinPixels: 2,
      getFillColor: [0, 128, 255, 120],
      getLineColor: [0, 0, 0, 255],
      pickable: true,
    });
  }, [geoJsonData]);

  const layers = [bitmapLayer, layer].filter(Boolean);

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
                position: "relative",
              }}
            >
              {/* Download Button */}
              <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadDEM}
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  zIndex: 10,
                  background:
                    "linear-gradient(90deg, #1976d2 0%, #2196f3 100%)",
                  color: "#fff",
                  fontWeight: 600,
                  boxShadow: 2,
                  "&:hover": {
                    background:
                      "linear-gradient(90deg, #1565c0 0%, #1976d2 100%)",
                  },
                }}
                disabled={
                  !getDEMCacheKey() || !localStorage.getItem(getDEMCacheKey()!)
                }
              >
                Download DEM
              </Button>
              {/* LinearProgress loading bar */}
              {loading && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    zIndex: 20,
                  }}
                >
                  <LinearProgress color="primary" />
                </Box>
              )}
              {/* Error Overlay */}
              {error && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    bgcolor: "rgba(255,255,255,0.85)",
                    zIndex: 30,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Stack spacing={2} alignItems="center">
                    <Alert severity="error" sx={{ fontSize: 18, py: 2, px: 4 }}>
                      {error}
                    </Alert>
                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<ReplayIcon />}
                        onClick={() => setRetryKey((k) => k + 1)}
                      >
                        Retry
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<CloseIcon />}
                        onClick={() => setError(null)}
                      >
                        Close
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              )}
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
                      mapTypeId="roadmap"
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
