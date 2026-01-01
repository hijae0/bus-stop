
// We'll use Seoul Station as the (0, 0, 0) origin for the South Korea Minecraft map
export const MC_ORIGIN = {
  name: "Seoul Station (서울역)",
  latitude: 37.5547,
  longitude: 126.9706,
  altitude: 64 // Standard sea level Y
};

// Factors for Lat/Long to Meters (approximate for Korea latitude)
// 1 degree Latitude ≈ 111,000 meters
// 1 degree Longitude ≈ 88,000 meters (at 37.5 degrees N)
export const LAT_TO_METERS = 111320;
export const LNG_TO_METERS = 88000;
