import { Map, LatLngBounds, MapOptions, Point } from "leaflet";
import { create } from "./WSCRS";
import { MapLayer } from "./MapLayer";

export interface WSMapOptions extends MapOptions {
  mapSizePixels: number;
  tileSize: number;
}

export class WSMap extends Map {
  private layers = <MapLayer[]>[];

  private constructor(
    element: string | HTMLElement,
    private tileSize: number,
    private bounds: LatLngBounds,
    options?: MapOptions
  ) {
    super(element, options);
  }

  public static create(options: WSMapOptions): WSMap {
    const { tileSize, mapSizePixels } =
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

    const map = new WSMap(
      "map",
      options.tileSize,
      bounds,
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
