import "leaflet/dist/leaflet.css";
import "./style.css";
import { WSMap, WSMapOptions } from "./WSMap";

const iconUrl = (iconName: string) => {
  return `/icons/${iconName}.png`;
};

window.onload = async () => {
  const map = WSMap.create({
    mapSizePixels: 5248,
    tileSize: 656,
    minZoom: 0,
    maxZoom: 3,
  });
  const mapLayer = map.addMapLayer();
};
