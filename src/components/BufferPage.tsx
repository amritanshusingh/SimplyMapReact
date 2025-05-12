import React from "react";
import { Grid, Card, Box } from "@mui/material";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { useTheme } from "@mui/material/styles"; // Import useTheme to access the current theme
import { darkModeMapStyles } from "../theme/mapStyles"; // Import dark mode map styles

const googleAPIkey = import.meta.env.VITE_GOOGLE_API_KEY;

const BufferPage: React.FC = () => {
  const theme = useTheme(); // Access the current theme
  const isDarkTheme = theme.palette.mode === "dark"; // Determine if the theme is dark
  return (
    <Grid sx={{ width: "100%", padding: "20px" }}>
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
              <Map
                mapTypeId="terrain"
                defaultZoom={13}
                defaultCenter={{
                  lat: 25.54196730756527,
                  lng: 77.36467900618521,
                }}
                styles={isDarkTheme ? darkModeMapStyles : []} // Ensure dark mode styles are applied when theme is dark
              ></Map>
            </APIProvider>
          </div>
        </Card>
      </Box>
    </Grid>
  );
};

export default BufferPage;
