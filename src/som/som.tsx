//Spatial Operations Module (JS) main file
import { kml } from "@tmcw/togeojson";

export function pointKMLtoLineKMLConverter(file: Blob): Promise<string | null> {
  return new Promise((resolve, reject) => {
    if (file.type === "application/vnd.google-earth.kml+xml") {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = reader.result as string;
          const parser = new DOMParser();
          const kmlDocument = parser.parseFromString(text, "application/xml");
          const geoJson = kml(kmlDocument);
          const lineKML = geoJsonToLineKML(geoJson);
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
