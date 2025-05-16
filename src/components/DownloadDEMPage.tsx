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
import { TerrainLayer } from "@deck.gl/geo-layers";
import { load } from "@loaders.gl/core";
import { GeoTIFFLoader } from "@loaders.gl/geotiff";

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
  const [terrainLayer, setTerrainLayer] = React.useState<any>(null);

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

  React.useEffect(() => {
    const openTopoApiKey = import.meta.env.VITE_OPENTOPO_API_KEY;
    if (
      geoJsonData &&
      geoJsonData.features &&
      geoJsonData.features.length > 0 &&
      openTopoApiKey
    ) {
      try {
        const [minLng, minLat, maxLng, maxLat] = bbox(geoJsonData);
        const url = `https://portal.opentopography.org/API/globaldem?demtype=SRTMGL1&south=${minLat}&north=${maxLat}&west=${minLng}&east=${maxLng}&outputFormat=GTiff&API_Key=${openTopoApiKey}`;
        console.log("DEM API URL:", url);
        fetch(url)
          .then(async (res) => {
            console.log("DEM API response status:", res.status);
            const contentType = res.headers.get("content-type");
            console.log("DEM API response content-type:", contentType);
            const blob = await res.blob();
            console.log("DEM API response blob:", blob);
            // Optionally, try to read the first few bytes for debugging
            const arrayBuffer = await blob.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer.slice(0, 16));
            console.log("DEM API response first 16 bytes:", bytes);
            // Create a new Blob with the correct MIME type
            const tiffBlob = new Blob([arrayBuffer], { type: "image/tiff" });
            const localUrl = URL.createObjectURL(tiffBlob);
            // Custom fetch to force correct content-type for loaders.gl
            const customFetch = (url: string) =>
              fetch(url).then(async (response) => {
                const data = await response.arrayBuffer();
                return new Response(data, {
                  status: 200,
                  statusText: "OK",
                  headers: { "content-type": "image/tiff" },
                });
              });
            setTerrainLayer(
              new TerrainLayer({
                id: "terrain-layer",
                elevationData: localUrl,
                texture: null, // No texture, just elevation
                bounds: [minLng, minLat, maxLng, maxLat],
                loaders: [GeoTIFFLoader],
                fetch: customFetch,
                wireframe: false,
                color: [255, 255, 255],
                opacity: 0.7,
              })
            );
          })
          .catch((err) => {
            console.error("Failed to fetch GeoTIFF:", err);
            setTerrainLayer(null);
            alert("Failed to fetch DEM from OpenTopography API.");
          });
      } catch (e) {
        setTerrainLayer(null);
        alert("Error processing DEM request.");
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
                    layers={[
                      ...(terrainLayer ? [terrainLayer] : []),
                      ...(layer ? [layer] : []),
                    ]}
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
