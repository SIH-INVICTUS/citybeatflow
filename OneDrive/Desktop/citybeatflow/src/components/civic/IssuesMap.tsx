import { useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Issue } from "@/data/mockData";

type IssuesMapProps = {
  issues: Issue[];
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
};

const statusToColor: Record<Issue["status"], string> = {
  pending: "#f59e0b",
  verified: "#10b981",
  "in-progress": "#3b82f6",
  resolved: "#22c55e",
  rejected: "#ef4444",
};

export default function IssuesMap({ issues, center, zoom = 12, className }: IssuesMapProps) {
  const mapCenter = useMemo(() => {
    if (center) return [center.lat, center.lng] as [number, number];
    if (issues.length > 0) return [issues[0].location.lat, issues[0].location.lng] as [number, number];
    return [0, 0] as [number, number];
  }, [center, issues]);

  return (
    <div className={className}>
      <MapContainer center={mapCenter} zoom={zoom} style={{ height: "100%", width: "100%", borderRadius: 12 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {issues.map((issue) => (
          <CircleMarker
            key={issue.id}
            center={[issue.location.lat, issue.location.lng]}
            radius={10}
            pathOptions={{ color: statusToColor[issue.status], fillColor: statusToColor[issue.status], fillOpacity: 0.7 }}
          >
            <Popup>
              <div style={{ minWidth: 200 }}>
                <strong>{issue.title}</strong>
                <div style={{ fontSize: 12, marginTop: 4 }}>{issue.location.address}</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Status: {issue.status}</div>
                {issue.priority && <div style={{ fontSize: 12 }}>Priority: {issue.priority}</div>}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}


