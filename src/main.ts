import "leaflet/dist/leaflet.css";
import "./style.css";
import { WSMap } from "./WSMap";
import { Layer } from "./Layer";
import { FilterCategory } from "./FilterCategory";
import * as Schema from "./JSONSchema";

window.onload = async () => {
  const iconUrl = (iconName: string) => {
    return `/icons/${iconName}.png`;
  };

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
  map.addFilterGroup(
    [
      {
        name: "Agility",
        values: ["agility"],
        iconUrl: iconUrl("activity_sprites/agility/dasboot3"),
      },
      {
        name: "Carpentry",
        values: ["carpentry"],
        iconUrl: iconUrl("activity_sprites/carpentry/full"),
      },
      {
        name: "Cooking",
        values: ["cooking"],
        iconUrl: iconUrl("activity_sprites/cooking/full"),
      },
      {
        name: "Crafting",
        values: ["crafting"],
        iconUrl: iconUrl("activity_sprites/crafting/full"),
      },
      {
        name: "Fishing",
        values: ["fishing"],
        iconUrl: iconUrl("activity_sprites/fishing/full"),
      },
      {
        name: "Carpentry",
        values: ["carpentry"],
        iconUrl: iconUrl("activity_sprites/full"),
      },
      {
        name: "Foraging",
        values: ["foraging"],
        iconUrl: iconUrl("activity_sprites/foraging/full"),
      },
      {
        name: "Mining",
        values: ["mining"],
        iconUrl: iconUrl("activity_sprites/mining/pickaxe"),
      },
      {
        name: "Smithing",
        values: ["smithing"],
        iconUrl: iconUrl("activity_sprites/smithing/full"),
      },
      {
        name: "Mining",
        values: ["mining"],
        iconUrl: iconUrl("activity_sprites/woodcutting/axe"),
      },
    ],
    "Skills"
  );
  map.addFilterGroup(
    [
      {
        name: "Store",
        values: [
          "generalStore",
          "fishingStore",
          "activityShop",
          "animalShelter",
          "marketStall",
        ],
        iconUrl: iconUrl("buildings/general_store"),
      },
      {
        name: "Bank",
        values: ["bank"],
        iconUrl: iconUrl("buildings/bank"),
      },
      {
        name: "Other",
        values: ["temple", "tavern", "house", "castle"],
        iconUrl: iconUrl("buildings/cabin"),
      },
    ],
    "Buildings"
  );
  map.addFilterGroup(
    [
      {
        name: "Forge",
        values: ["basic_forge", "advanced_forge", "frozen_forge"],
        iconUrl: "services/forge",
      },
      {
        name: "Kitchen",
        values: ["basic_kitchen", "advanced_kitchen"],
        iconUrl: "services/kitchen",
      },
      {
        name: "Sawmill",
        values: ["basic_sawmill", "advanced_sawmill"],
        iconUrl: "services/sawmill",
      },
      {
        name: "Workshop",
        values: ["basic_workshop", "advanced_workshop"],
        iconUrl: "services/workshop",
      },
    ],
    "Services"
  );

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
};
