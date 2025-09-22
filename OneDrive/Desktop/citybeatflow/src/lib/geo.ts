export type LatLng = { lat: number; lng: number };

// Tadepalligudem Municipal Office (approximate center)
export const municipalCenter: LatLng = { lat: 16.813, lng: 81.527 };

export function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371; // km
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}

export function withinRadius(center: LatLng, point: LatLng, radiusKm: number): boolean {
  return haversineKm(center, point) <= radiusKm;
}


