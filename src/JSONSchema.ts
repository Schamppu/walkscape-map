import { LatLngTuple } from "leaflet";

export interface Category {
  name: string;
  layers: Layer[];
}

export interface Layer {
  name?: string;
  minZoom?: number;
  maxZoom: number;
  markers: Marker[] | Location[];
}

export interface Marker {
  coords: LatLngTuple;
  icon: { url: string; width?: number; height?: number };
  id: string;
  name: string;
}

export interface Location extends Marker {
  hidden: boolean;
  realm: string;
  activities: string[];
  buildings: string[];
  services: string[];
}

export interface Activity {
  id: string;
  name: string;
  icon: { url: string; width?: number; height?: number };
  skills: string[];
  levelRequirements?: { [key: string]: number };
  requiredKeywords: string[];
}

export interface Service {
  name: string;
  id: string;
  icon: { url: string; width?: number; height?: number };
}

export interface Building {
  name: string;
  id: string;
  icon: { url: string; width?: number; height?: number };
}
