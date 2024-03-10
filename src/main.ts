import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { LatLngBounds } from 'leaflet';
import './style.css'

function iconUrl(iconName: string) {
  return `/icons/${iconName}.png`;
}

const initMap = () => {
  const mapSizePixels = 5248;
  const tileSize = 656;

  const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: 0,
    maxZoom: 3,
  }).setView([-1/2*tileSize, 3/4*tileSize], 1); // Set initial view

  const bounds = new LatLngBounds(
    map.unproject([0, 2 * mapSizePixels], map.getMaxZoom()),
    map.unproject([4 * mapSizePixels, 0], map.getMaxZoom())
  );
  map.setMaxBounds(bounds)

  L.tileLayer('tiles/{z}/{x}_{y}.png', {
    attribution: 'WalkScape Interactive Map',
    tileSize,
    minZoom: 0,
    maxZoom: 3,
    noWrap: true,
  }).addTo(map);
  

  // Enable dragging and zooming
  map.dragging.enable();
  map.scrollWheelZoom.enable();

  map.on('click', () => {
    console.log(map.getCenter());
    console.log(map.getBounds().getSouthWest(), map.getBounds().getNorthEast());
  })
};

document.addEventListener('DOMContentLoaded', initMap);