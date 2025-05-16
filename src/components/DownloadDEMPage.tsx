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
import { GeoTIFF } from "geotiff";

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
  const [parsedBitmapLayer, setParsedBitmapLayer] = React.useState<any>(null);

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
    async function parseBitmapLayer() {
      try {
        const response = await fetch("/test.tif");
        if (!response.ok) {
          console.error("Failed to fetch test.tif:", response.statusText);
          setParsedBitmapLayer(null);
          return;
        }
        const arrayBuffer = await response.arrayBuffer();
        // Use GeoTIFF['fromArrayBuffer'] or GeoTIFF['parse'] for compatibility
        let tiff;
        if (typeof (GeoTIFF as any)["fromArrayBuffer"] === "function") {
          tiff = await (GeoTIFF as any)["fromArrayBuffer"](arrayBuffer);
        } else if (typeof (GeoTIFF as any).parse === "function") {
          tiff = await (GeoTIFF as any).parse(arrayBuffer);
        } else {
          throw new Error(
            "GeoTIFF.fromArrayBuffer/parse is not available. GeoTIFF API may have changed."
          );
        }
        const image = await tiff.getImage();
        const rasters = await image.readRasters({ interleave: true });
        const width = image.getWidth();
        const height = image.getHeight();
        // Get bounds from GeoTIFF (if available), else use a default
        let bounds: [number, number, number, number] = [77.0, 25.0, 78.0, 26.0];
        const tiepoint = image.getTiePoints?.()[0];
        const pixelScale = image.getFileDirectory().ModelPixelScale;
        if (tiepoint && pixelScale) {
          const minX = tiepoint.x;
          const maxY = tiepoint.y;
          const pixelSizeX = pixelScale[0];
          const pixelSizeY = pixelScale[1];
          const maxX = minX + width * pixelSizeX;
          const minY = maxY - height * pixelSizeY;
          bounds = [minX, minY, maxX, maxY];
        }
        // Convert raster to ImageData (RGBA)
        let imageData;
        if (rasters.length === width * height * 4) {
          // RGBA
          imageData = new ImageData(
            new Uint8ClampedArray(rasters),
            width,
            height
          );
        } else if (rasters.length === width * height * 3) {
          // RGB, add alpha
          const rgba = new Uint8ClampedArray(width * height * 4);
          for (let i = 0; i < width * height; i++) {
            rgba[i * 4] = rasters[i * 3];
            rgba[i * 4 + 1] = rasters[i * 3 + 1];
            rgba[i * 4 + 2] = rasters[i * 3 + 2];
            rgba[i * 4 + 3] = 255;
          }
          imageData = new ImageData(rgba, width, height);
        } else {
          // Single band (grayscale)
          const rgba = new Uint8ClampedArray(width * height * 4);
          for (let i = 0; i < width * height; i++) {
            const v = rasters[i];
            rgba[i * 4] = v;
            rgba[i * 4 + 1] = v;
            rgba[i * 4 + 2] = v;
            rgba[i * 4 + 3] = 255;
          }
          imageData = new ImageData(rgba, width, height);
        }
        // Draw to canvas and get data URL
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.putImageData(imageData, 0, 0);
          const dataUrl = canvas.toDataURL();
          setParsedBitmapLayer({
            id: "bitmap-layer",
            bounds,
            image: dataUrl,
            opacity: 0.7,
            visible: true,
          });
        } else {
          console.error("Could not get 2D context for canvas");
          setParsedBitmapLayer(null);
        }
      } catch (err) {
        console.error("Error loading or parsing test.tif:", err);
        setParsedBitmapLayer(null);
      }
    }
    parseBitmapLayer();
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
                    layers={[layer]}
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
              </div>
            </Card>
          </Box>
        </Grid>
      )}
    </Grid>
  );
};

export default DownloadDEMPage;
