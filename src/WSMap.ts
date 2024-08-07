import { Map, LatLngBounds, MapOptions, Point } from "leaflet";
import { create } from "./utils/WSCRS";
import { MapLayer } from "./MapLayer";
import { Layer } from "./Layer";
import { ControlDock } from "./Controls/ControlDock";
import { ZoomControl } from "./Controls/ZoomControl";
import { FilterControl } from "./Controls/FilterControl";
import { LayersControl } from "./Controls/LayersControl";
import { FilterCategory } from "./Interfaces/FilterCategory";
import * as Schema from "./Interfaces/JSONSchema";
import { URLResolver } from "./URLResolver";

export interface WSMapOptions extends MapOptions {
  mapSizePixels: number;
  tileSize: number;
}

export class WSMap extends Map {
  public layers = <MapLayer[]>[];
  private filterControl?: FilterControl;
  private layersControl?: LayersControl;
  private urlResolver?: URLResolver;
  private mapLayers: Record<string, MapLayer> = {};

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

  public addMapLayer(
    layerName: string,
    displayName: string,
    tilePath: string,
    visible: boolean = false,
    legacy: boolean = false
  ): MapLayer {
    const layer = new MapLayer(
      this,
      layerName,
      displayName,
      tilePath,
      this.tileSize,
      this.bounds,
      legacy
    );
    this.addLayer(layer);
    this.layers.push(layer);
    if (visible) layer.show();
    this.mapLayers[layerName] = layer;
    return layer;
  }

  public addRealmKeywords() {
    for (const mapLayer of Object.values(this.mapLayers)) {
      mapLayer.addRealmKeywords();
    }
  }

  public addCategory(category: Schema.Category, data: Schema.DataPoint[][]) {
    for (const layer of category.layers) {
      for (const mapLayerName of layer.mapLayers) {
        const mapLayer = this.mapLayers[mapLayerName];
        mapLayer.addCategory(
          category.name,
          Layer.fromJson(layer, category.name, data)
        );
      }
    }
  }

  public addControls(): void {
    this.urlResolver = URLResolver.create(this);
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

    this.layersControl = new LayersControl(this.mapLayers);
    controls.addControl(this.layersControl);
    controls.addTo(this);
  }

  public addFilterGroup(filters: FilterCategory[] = [], group: string): void {
    for (const category of filters) {
      this.filterControl?.addCategory(category, group);
    }
  }

  private getVisibleMapLayerName(): string {
    for (const [name, layer] of Object.entries(this.mapLayers)) {
      if (layer.isVisible()) return name;
    }
    // One should always be visible, so this should never happen
    return Object.keys(this.mapLayers)[0];
  }

  public showLayer(layerName: string) {
    if (this.layersControl) this.layersControl.enableMapLayer(layerName);
  }

  public findMarker(
    layerName: string | null,
    locationName: string | null,
    openPopup: boolean
  ) {
    if (!locationName) return;

    const usedLayerName = layerName || this.getVisibleMapLayerName();
    this.showLayer(usedLayerName);
    const layer = this.mapLayers[usedLayerName];

    const location = locationName.toLocaleLowerCase();
    layer.findLocationMarker(location, openPopup);
  }

  public resolveFilters(categoryNames: string[]) {
    if (this.filterControl) this.filterControl.resolveFromUrl(categoryNames);
  }

  public resolveURL() {
    if (this.urlResolver) this.urlResolver.resolveURL();
  }
}
