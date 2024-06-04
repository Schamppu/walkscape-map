import { LatLngTuple } from "leaflet";

export interface Category {
  name: string;
  layers: Layer[];
}

export interface Layer {
  mapLayers: string[];
  minZoom?: number;
  maxZoom: number;
  labelMinZoom: number;
  markers: Marker[] | Location[];
}

export interface Marker {
  coords: LatLngTuple;
  icon: { url: string; width?: number; height?: number };
  id: string;
  name: string;
  hidden?: boolean;
}

export interface Realm extends Marker {
  fullName?: string,
  motto: string,
  lore: string,
  info: string[],
}

export interface Location extends Marker {
  realm: string;
  wikiUrl: string;
  activities: string[];
  buildings: string[];
  services: string[];
}

export interface MappedLocation extends Marker {
  hidden: boolean;
  realm: string;
  wikiUrl: string;
  activities: Activity[];
  buildings: Building[];
  services: Service[];
  keywords: string[];
}

export interface DataPoint {
  id: string;
  name: string;
  wikiUrl: string,
  icon: { url: string; width?: number; height?: number };
}

export interface Activity extends DataPoint {
  skills: string[];
  levelRequirements: { [key: string]: number };
  requiredKeywords: string[];
}

export interface Building extends DataPoint {
  type: string;
  shop: string;
}

export interface Service extends DataPoint {
  skills: string[];
}
