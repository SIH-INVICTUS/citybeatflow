import React, { useEffect, useRef, useState } from "react";
import type { Issue } from "@/data/mockData";

type IssuesMapProps = {
  issues: Issue[];
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
};

const DEFAULT_API_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyBcf2LGvozTZb-VOjNpU0GrXf4Xb2QQNAE";

function loadGoogleMaps(apiKey: string) {
  // If already loaded, resolve immediately
  if ((window as any).google && (window as any).google.maps) return Promise.resolve((window as any).google.maps);
  // Avoid injecting script multiple times
  const existing = document.getElementById("gmaps-script");
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve((window as any).google.maps));
      existing.addEventListener("error", () => reject(new Error("Failed to load Google Maps script")));
    });
  }
  const script = document.createElement("script");
  script.id = "gmaps-script";
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
  return new Promise((resolve, reject) => {
    script.onload = () => resolve((window as any).google.maps);
    script.onerror = () => reject(new Error("Failed to load Google Maps script"));
  });
}

export default function IssuesMap({ issues, center, zoom = 12, className }: IssuesMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadGoogleMaps(DEFAULT_API_KEY)
      .then((maps) => {
        if (!mounted) return;
        setMapsLoaded(true);
        const initialCenter = center || (issues.length ? { lat: issues[0].location.lat, lng: issues[0].location.lng } : { lat: 0, lng: 0 });
        mapRef.current = new maps.Map(containerRef.current as HTMLDivElement, {
          center: initialCenter,
          zoom,
          mapTypeControl: false,
          fullscreenControl: true,
        });
        infoWindowRef.current = new maps.InfoWindow();
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error("Failed to load Google Maps:", err);
      });
    return () => {
      mounted = false;
      // cleanup markers
      markersRef.current.forEach((m) => m && m.setMap && m.setMap(null));
      markersRef.current = [];
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
        infoWindowRef.current = null;
      }
      // note: do not remove script tag as other parts of app may use it
    };
  }, []); // load once

  useEffect(() => {
    if (!mapsLoaded || !mapRef.current) return;
    const maps = (window as any).google.maps;

    // remove old markers
    markersRef.current.forEach((m) => m && m.setMap && m.setMap(null));
    markersRef.current = [];

    const bounds = new maps.LatLngBounds();

    issues.forEach((issue) => {
      const pos = { lat: issue.location.lat, lng: issue.location.lng };
      const color = statusToHex(issue.status);
      const marker = new maps.Marker({
        position: pos,
        map: mapRef.current,
        title: issue.title,
        icon: {
          path: maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: color,
          fillOpacity: 0.85,
          strokeColor: shadeColor(color, -20),
          strokeWeight: 1,
        },
      });

      marker.addListener('click', () => {
        if (infoWindowRef.current) infoWindowRef.current.close();
        const content = `<div style="min-width:200px"><strong>${escapeHtml(issue.title)}</strong><div style="font-size:12px;margin-top:4px">${escapeHtml(issue.location.address || '')}</div><div style="font-size:12px;margin-top:4px">Status: ${escapeHtml(issue.status)}</div>${issue.priority ? `<div style="font-size:12px">Priority: ${escapeHtml(issue.priority)}</div>` : ''}</div>`;
        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(mapRef.current, marker);
      });

      markersRef.current.push(marker);
      bounds.extend(pos);
    });

    if (!bounds.isEmpty && issues.length) {
      mapRef.current.fitBounds(bounds, { top: 40, bottom: 40, left: 40, right: 40 });
    } else if (center) {
      mapRef.current.setCenter(center);
      mapRef.current.setZoom(zoom);
    }
  }, [issues, mapsLoaded, center, zoom]);

  return <div ref={containerRef} className={className} style={{ height: '100%', width: '100%', borderRadius: 12 }} />;
}

function statusToHex(status: string) {
  switch (status) {
    case 'pending':
      return '#f59e0b';
    case 'verified':
      return '#10b981';
    case 'in-progress':
    case 'in_progress':
      return '#3b82f6';
    case 'resolved':
      return '#22c55e';
    case 'rejected':
      return '#ef4444';
    default:
      return '#9CA3AF';
  }
}

// Basic HTML-escaping to prevent injection in InfoWindow content.
function escapeHtml(s: string) {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Shade color by percent (-100..100). Small helper to create stroke color.
function shadeColor(hex: string, percent: number) {
  const f = parseInt(hex.slice(1), 16);
  const t = percent < 0 ? 0 : 255;
  const p = Math.abs(percent) / 100;
  const R = Math.round((t - (f >> 16)) * p) + (f >> 16);
  const G = Math.round((t - ((f >> 8) & 0x00FF)) * p) + ((f >> 8) & 0x00FF);
  const B = Math.round((t - (f & 0x0000FF)) * p) + (f & 0x0000FF);
  return `#${(0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
}


