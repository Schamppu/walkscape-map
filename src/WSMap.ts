import { Map, LatLngBounds, MapOptions, Point } from "leaflet";
import { create } from "./WSCRS";
import { MapLayer } from "./MapLayer";
import * as Schema from "./JSONSchema";

export interface WSMapOptions extends MapOptions {
  mapSizePixels: number;
  tileSize: number;
  activities: Schema.DataPoint[];
  buildings: Schema.DataPoint[];
  services: Schema.DataPoint[];
}

export class WSMap extends Map {
  private layers = <MapLayer[]>[];

  private constructor(
    element: string | HTMLElement,
    private tileSize: number,
    private bounds: LatLngBounds,
    public activities: Schema.Activity[],
    public buildings: Schema.Building[],
    public services: Schema.Service[],
    options?: MapOptions
  ) {
    super(element, options);
    console.log(this.activities);
    console.log(this.buildings);
    console.log(this.services);
  }

  public static create(options: WSMapOptions): WSMap {
    function isActivities(data: Schema.DataPoint[]): data is Schema.Activity[] {
      const keys = Object.keys(data[0]);
      return keys.includes("skills") && keys.includes("levelRequirements");
    }

    function isBuildings(data: Schema.DataPoint[]): data is Schema.Building[] {
      const keys = Object.keys(data[0]);
      return keys.includes("type") && keys.includes("shop");
    }

    function isServices(data: Schema.DataPoint[]): data is Schema.Service[] {
      const keys = Object.keys(data[0]);
      return keys.includes("skills") && !keys.includes("levelRequirements");
    }

    const { tileSize, mapSizePixels, activities, buildings, services } =
      options;
    const crs = create(mapSizePixels, tileSize);
    options.crs = crs;

    const maxZoom = Math.round(Math.log(mapSizePixels / tileSize) * Math.LOG2E);
    if (options.maxZoom == undefined) {
      options.maxZoom = maxZoom;
    }
    if (options.minZoom == undefined) {
      options.minZoom = maxZoom - 3;
    }

    const bounds = new LatLngBounds(
      crs.pointToLatLng(new Point(0, 2 * mapSizePixels), options.maxZoom),
      crs.pointToLatLng(new Point(4 * mapSizePixels, 0), options.maxZoom)
    );
    options.maxBounds = bounds;

    let act: Schema.Activity[] = [];
    let bui: Schema.Building[] = [];
    let ser: Schema.Service[] = [];
    if (isActivities(activities)) act = activities;
    if (isBuildings(buildings)) bui = buildings;
    if (isServices(services)) ser = services;

    const map = new WSMap(
      "map",
      options.tileSize,
      bounds,
      act,
      bui,
      ser,
      options
    ).setView([(-1 / 2) * tileSize, (3 / 4) * tileSize], 1);
    // Enable dragging and zooming
    map.dragging.enable();
    map.scrollWheelZoom.enable();

    map.on("click", () => {
      console.log(map.getCenter());
    });

    map.on("zoomend", function () {
      map.layers.forEach((l) => {
        l.updateZoom(map.getZoom());
      });
    });

    map.on("move", () => {
      map.layers.forEach((l) => {
        l.updateMarkersVisibility();
      });
    });

    return map;
  }

  public addMapLayer(layerName = "Default"): MapLayer {
    const layer = new MapLayer(this, layerName, this.tileSize, this.bounds);
    this.addLayer(layer);
    this.layers.push(layer);
    layer.show();
    return layer;
  }
}
