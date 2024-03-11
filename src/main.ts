import 'leaflet/dist/leaflet.css';
import { Map, LatLngBounds, CRS, TileLayer } from 'leaflet';
import './style.css'

const iconUrl = (iconName: string) => {
  return `/icons/${iconName}.png`;
}

const initMap = () => {
  const mapSizePixels = 5248;
  const tileSize = 656;
  const minZoom = 0;
  const maxZoom = 3;

  const map = new Map('map', {
    crs: CRS.Simple,
    minZoom,
    maxZoom,
  }).setView([-1/2*tileSize, 3/4*tileSize], 1); // Set initial view

  const bounds = new LatLngBounds(
    map.unproject([0, 2 * mapSizePixels], map.getMaxZoom()),
    map.unproject([4 * mapSizePixels, 0], map.getMaxZoom())
  );
  map.setMaxBounds(bounds)

  new TileLayer('tiles/{z}/{x}_{y}.png', {
    attribution: 'WalkScape Interactive Map',
    tileSize,
    minZoom,
    maxZoom,
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

window.onload = async () => {
  initMap()
};