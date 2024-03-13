import { LatLngTuple } from "leaflet";

export interface Category {
  name: string;
  layers: Layer[];
}

export interface Layer {
  name?: string;
  minZoom?: number;
  maxZoom: number;
  icon?: { url: string; width?: number; height?: number };
  markers: Marker[];
}

export interface Marker {
  coords: LatLngTuple;
  hidden?: boolean;
  icon?: { url: string; width?: number; height?: number };
  id: string;
  name: string;
  realm?: string[];
  activities?: string[];
  buildings?: string[];
  services?: string[];
}

export interface Activity {
  name: string;
  id: string;
  skills: string[];
  requirements?: { [key: string]: number };
  icon?: { url: string; width: number; height: number };
}

export interface Service {
  name: string;
  id: string;
  icon?: { url: string; width: number; height: number };
}

export interface Building {
  name: string;
  id: string;
  icon?: { url: string; width: number; height: number };
}
