import { useState, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { Badge } from "@/components/ui/badge";

interface OutbreakData {
  location: string;
  cases: number;
  severity: "low" | "medium" | "high";
  coordinates: { lat: number; lng: number };
}

interface OutbreakMapProps {
  height?: string;
  zoom?: number;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "high":
      return "#ef4444";
    case "medium":
      return "#f59e0b";
    case "low":
      return "#3b82f6";
    default:
      return "#6b7280";
  }
};

const getRadius = (cases: number) => {
  return Math.max(10, Math.min(40, cases / 5));
};

export default function OutbreakMap({
  height = "500px",
  zoom = 5,
}: OutbreakMapProps) {
  const [outbreaks, setOutbreaks] = useState<OutbreakData[]>([]);

  useEffect(() => {
    // Mock outbreak data for demonstration
    const mockOutbreakData: OutbreakData[] = [
      {
        location: "Mumbai",
        cases: 45,
        severity: "high",
        coordinates: { lat: 19.076, lng: 72.8777 },
      },
      {
        location: "Delhi",
        cases: 32,
        severity: "medium",
        coordinates: { lat: 28.7041, lng: 77.1025 },
      },
      {
        location: "Bangalore",
        cases: 18,
        severity: "low",
        coordinates: { lat: 12.9716, lng: 77.5946 },
      },
      {
        location: "Chennai",
        cases: 28,
        severity: "medium",
        coordinates: { lat: 13.0827, lng: 80.2707 },
      },
      {
        location: "Kolkata",
        cases: 15,
        severity: "low",
        coordinates: { lat: 22.5726, lng: 88.3639 },
      },
    ];

    setOutbreaks(mockOutbreakData);

    // You can replace this with your actual API call
    // Example:
    // fetch('/api/outbreaks')
    //   .then(res => res.json())
    //   .then(data => setOutbreaks(data))
    //   .catch(err => console.error('Error fetching outbreak data:', err));
  }, []);

  return (
    <div
      style={{ height, width: "100%" }}
      className="rounded-lg overflow-hidden border-2 border-border"
    >
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {outbreaks.map((outbreak, index) => (
          <CircleMarker
            key={index}
            center={[outbreak.coordinates.lat, outbreak.coordinates.lng]}
            radius={getRadius(outbreak.cases)}
            pathOptions={{
              fillColor: getSeverityColor(outbreak.severity),
              color: getSeverityColor(outbreak.severity),
              weight: 2,
              opacity: 0.8,
              fillOpacity: 0.6,
            }}
          >
            <Popup>
              <div className="p-2">
                <p className="font-semibold text-base mb-1">
                  {outbreak.location}
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                  Cases: {outbreak.cases}
                </p>
                <Badge
                  variant={
                    outbreak.severity === "high" ? "destructive" : "secondary"
                  }
                  className="uppercase"
                >
                  {outbreak.severity}
                </Badge>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
