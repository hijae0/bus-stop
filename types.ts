
export interface BusStopInfo {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  city?: string;
  description?: string;
}

export interface MinecraftCoords {
  x: number;
  y: number;
  z: number;
  originName: string;
}

export interface ConversionResult {
  stop: BusStopInfo;
  coords: MinecraftCoords;
  sources: { web: { uri: string; title: string } }[];
}
