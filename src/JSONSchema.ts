import { LatLngTuple } from "leaflet";

export interface Category {
  name: string;
  layers: Layer[];
}

export interface Layer {
  name?: string;
  minZoom?: number;
  maxZoom: number;
  icon?: { url: string; width: number; height: number };
  markers: Marker[];
}

export interface Marker {
  coords: LatLngTuple;
  id: string;
  name: string;
  icon?: { url: string; width: number; height: number };
}
