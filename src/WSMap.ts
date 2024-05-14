import { Map, LatLngBounds, MapOptions, Point } from "leaflet";
import { create } from "./WSCRS";
import { MapLayer } from "./MapLayer";
import { ControlDock } from "./Controls/ControlDock";
import { ZoomControl } from "./Controls/ZoomControl";
import { FilterControl } from "./Controls/FilterControl";
import { FilterCategory } from "./FilterCategory";

export interface WSMapOptions extends MapOptions {
  mapSizePixels: number;
  tileSize: number;
}

export class WSMap extends Map {
  private layers = <MapLayer[]>[];
  private filterControl?: FilterControl;

  private constructor(
    element: string | HTMLElement,
    private tileSize: number,
    private bounds: LatLngBounds,
    options?: MapOptions
  ) {
    super(element, options);
  }

  public static create(options: WSMapOptions): WSMap {
    const { tileSize, mapSizePixels } = options;
    const crs = create(mapSizePixels, tileSize);
    options.crs = crs;

    const maxZoom = Math.round(Math.log(mapSizePixels / tileSize) * Math.LOG2E);
    if (options.maxZoom == undefined) {
      options.maxZoom = maxZoom;
    }
    if (options.minZoom == undefined) {
      options.minZoom = maxZoom - 4;
    }

    const SW = crs.pointToLatLng(
      new Point(0, 4 * mapSizePixels),
      options.maxZoom
    );
    const NE = crs.pointToLatLng(
      new Point(6 * mapSizePixels, 0),
      options.maxZoom
    );
    const bounds = new LatLngBounds(SW, NE);
    options.maxBounds = bounds;

    options.zoomControl = false; // using a custom zoom control instead

    const map = new WSMap("map", options.tileSize, bounds, options).setView(
      [tileSize, (3 / 2) * tileSize],
      2
    );

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

  public addControls(): void {
    const controls = new ControlDock();

    // Zoom
    const zoomControl = new ZoomControl({
      minZoom: this.getMinZoom(),
      maxZoom: this.getMaxZoom(),
      initialZoom: this.getZoom(),
      zoomIn: () => this.zoomIn(),
      zoomOut: () => this.zoomOut(),
    });
    controls.addZoom(zoomControl);
    this.on("zoomend zoomlevelschange", () => {
      zoomControl.setZoom(this.getZoom());
    });

    // Filter
    this.filterControl = new FilterControl(this.layers);
    controls.addControl(this.filterControl);

    controls.addTo(this);
  }

  public addFilterGroup(filters: FilterCategory[] = [], group: string): void {
    for (const category of filters) {
      this.filterControl?.addCategory(category, group);
    }
  }

  public findMarker() {
    const urlParams = new URLSearchParams(window.location.search);
    const location = urlParams.get("l");
    if (!location) {
      return;
    }

    this.layers.forEach((l) => {
      l.findLocationMarker(location);
    });
  }

  public resolveFilters() {
    this.filterControl?.resolveUrl();
  }
}
