import "leaflet/dist/leaflet.css";
import "./style.css";
import { WSMap } from "./WSMap";
import { Layer } from "./Layer";
import * as Schema from "./Interfaces/JSONSchema";
import filterGroups from "./data/filterGroups.js";

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
  const data = [activities, buildings, services];

  const map = WSMap.create({
    mapSizePixels: 4096,
    tileSize: 512,
    minZoom: 0,
    maxZoom: 4,
  });
  const mapLayer = map.addMapLayer();
  map.addControls();

  for (const [group, filters] of Object.entries(filterGroups)) {
    map.addFilterGroup(filters, group);
  }

  function addJson(categories: Schema.Category[]): void {
    for (const category of categories) {
      mapLayer.addCategory(
        category.name,
        category.layers.map((l) => Layer.fromJson(l, category.name, data))
      );
    }
  }

  const locations = fetch("data/locations.json")
    .then((r) => r.json())
    .then(addJson);

  await Promise.allSettled([locations]);
  map.findMarker();
  map.resolveFilters();
};
