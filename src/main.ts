import "leaflet/dist/leaflet.css";
import "./styles/main.scss";
import "./styles/globals/typography.scss";
import "./styles/globals/tailorings.scss";

import { inject } from "@vercel/analytics";
import { WSMap } from "./WSMap";
import * as Schema from "./Interfaces/JSONSchema";
import { mapLayers } from "./data/mapLayers";
import { filterGroups } from "./data/filterGroups";

window.onload = async () => {
  inject();

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

  for (const values of mapLayers) {
    const [name, displayName, tileLayer, visible, legacy] = values;
    map.addMapLayer(name, displayName, tileLayer, visible, legacy);
  }

  map.addControls();
  for (const [name, values] of Object.entries(filterGroups)) {
    map.addFilterGroup(values, name);
  }

  function addJson(categories: Schema.Category[]): void {
    for (const category of categories) {
      map.addCategory(category, data);
    }
  }

  const locations = fetch("data/locations.json")
    .then((r) => r.json())
    .then(addJson);

  await Promise.allSettled([locations]);
  map.addRealmKeywords();
  map.resolveURL();
  map.resolveFilters();
};
