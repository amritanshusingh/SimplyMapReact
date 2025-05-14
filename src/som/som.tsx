//Spatial Operations Module (JS) main file
import { kml } from "@tmcw/togeojson";

export function pointKMLtoLineKMLConverter(file: Blob): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const fileName = (file as File)?.name || ""; // Safely access the name property with a fallback
    if (
      file.type === "application/vnd.google-earth.kml+xml" ||
      fileName.endsWith(".kml")
    ) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = reader.result as string;
          const parser = new DOMParser();
          const kmlDocument = parser.parseFromString(text, "application/xml");
          const geoJson = kml(kmlDocument);
          const lineKML = geoJsonToLineKML(geoJson);
          const trimmedLineKML = lineKML?.trim(); // Trim the KML string
          if (trimmedLineKML) {
            localStorage.setItem("trimmedLineKML", trimmedLineKML); // Save to browser's cache
          }
          resolve(lineKML);
        } catch (error) {
          console.error("Error processing the KML file:", error);
          reject(error);
        }
      };
      reader.onerror = () => {
        console.error("Error reading the file.");
        reject(new Error("Error reading the file."));
      };
      reader.readAsText(file);
    } else {
      console.error("Invalid file type. Please upload a KML file.");
      reject(new Error("Invalid file type. Please upload a KML file."));
    }
  });
}

export function lineKMLtoPolygonKMLConverter(
  file: Blob
): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const fileName = (file as File)?.name || ""; // Safely access the name property with a fallback
    if (
      file.type === "application/vnd.google-earth.kml+xml" ||
      fileName.endsWith(".kml")
    ) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = reader.result as string;
          const parser = new DOMParser();
          const kmlDocument = parser.parseFromString(text, "application/xml");
          const geoJson = kml(kmlDocument);
          console.log(geoJson);
          const polygonKML = geoJsonToPolygonKML(geoJson);
          resolve(polygonKML);
        } catch (error) {
          console.error("Error processing the KML file:", error);
          reject(error);
        }
      };
      reader.onerror = () => {
        console.error("Error reading the file.");
        reject(new Error("Error reading the file."));
      };
      reader.readAsText(file);
    } else {
      console.error("Invalid file type. Please upload a KML file.");
      reject(new Error("Invalid file type. Please upload a KML file."));
    }
  });
} // Correctly closed the function block and added the missing semicolon

export function geoJsonToLineKML(geoJson: any): string | null {
  if (geoJson && geoJson.features) {
    const coordinates = geoJson.features.flatMap((feature: any) => {
      if (feature.geometry.type === "Point") {
        return [feature.geometry.coordinates];
      }
      return [];
    });

    if (coordinates.length < 2) {
      console.error(
        "The GeoJSON does not contain enough points to form a line."
      );
      return null;
    }

    const lineString = `
      <Placemark>
        <LineString>
          <coordinates>
            ${coordinates
              .map(([lng, lat]: [number, number]) => `${lng},${lat}`)
              .join(" ")}
          </coordinates>
        </LineString>
      </Placemark>
    `;

    return `
      <?xml version="1.0" encoding="UTF-8"?>
      <kml xmlns="http://www.opengis.net/kml/2.2">
        <Document>
          ${lineString}
        </Document>
      </kml>
    `;
  } else {
    console.error("Invalid GeoJSON data.");
    return null;
  }
}

export function geoJsonToPolygonKML(geoJson: any): string | null {
  if (geoJson && geoJson.features) {
    const coordinates = geoJson.features.flatMap((feature: any) => {
      if (feature.geometry.type === "LineString") {
        return feature.geometry.coordinates;
      }
      return [];
    });

    if (coordinates.length < 3) {
      console.error(
        "The GeoJSON does not contain enough points to form a polygon."
      );
      return null;
    }

    const polygon = `
      <Placemark>
        <Polygon>
          <outerBoundaryIs>
            <LinearRing>
              <coordinates>
                ${coordinates
                  .map(([lng, lat]: [number, number]) => `${lng},${lat}`)
                  .join(" ")}
              </coordinates>
            </LinearRing>
          </outerBoundaryIs>
        </Polygon>
      </Placemark>
    `;

    return `
      <?xml version="1.0" encoding="UTF-8"?>
      <kml xmlns="http://www.opengis.net/kml/2.2">
        <Document>
          ${polygon}
        </Document>
      </kml>
    `;
  } else {
    console.error("Invalid GeoJSON data.");
    return null;
  }
}
