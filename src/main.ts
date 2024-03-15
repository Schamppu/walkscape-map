import "leaflet/dist/leaflet.css";
import "./style.css";
import { WSMap } from "./WSMap";
import { Layer } from "./Layer";
import * as Schema from "./JSONSchema";

/*
const iconUrl = (iconName: string) => {
  return `/icons/${iconName}.png`;
};
*/

window.onload = async () => {
  function returnValue(arr: Schema.DataPoint[]) {
    return arr;
  }

  const promises = ["activities", "buildings", "services"].map((name) =>
    fetch(`data/${name}.json`)
      .then((r) => r.json())
      .then(returnValue)
  );
  const [activities, buildings, services] = await Promise.all(promises);

  const map = WSMap.create({
    mapSizePixels: 5248,
    tileSize: 656,
    minZoom: 0,
    maxZoom: 3,
    activities,
    buildings,
    services,
  });
  const mapLayer = map.addMapLayer();

  function addJson(categories: Schema.Category[]): void {
    for (const category of categories) {
      mapLayer.addCategory(
        category.name,
        category.layers.map((l) => Layer.fromJson(l, category.name))
      );
    }
  }

  const locations = fetch("data/locations.json")
    .then((r) => r.json())
    .then(addJson);

  await Promise.allSettled([locations]);
};
