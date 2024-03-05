export function extractCoords(geometry: google.maps.GeocoderGeometry): {
  lat: number;
  lng: number;
} {
  return {
    lat: geometry.location.lat(),
    lng: geometry.location.lng(),
  };
}
