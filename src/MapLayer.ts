import { LatLngBounds, LayerGroup, TileLayer } from "leaflet";
import { WSMap } from "./WSMap";
import { Layer, Visibility } from "./Layer";
import { WSMarker } from "./Markers/WSMarker";

export class MapLayer extends LayerGroup {
  public tileLayer: TileLayer;
  public markerLayer: LayerGroup;
  private categories: Record<string, Layer[]> = {};
  private currentZoom = 2;

  public constructor(
    private map: WSMap,
    public layerName: string,
    public tileSize: number,
    bounds: LatLngBounds
  ) {
    super();
    this.tileLayer = new TileLayer("tiles/{z}/{x}_{y}.png", {
      tileSize: tileSize,
      minZoom: 0,
      maxZoom: map.getMaxZoom(),
      bounds: bounds,
      noWrap: true,
    });
    this.markerLayer = new LayerGroup();
  }

  public show(): void {
    if (!this.hasLayer(this.tileLayer)) {
      this.addLayer(this.tileLayer);
    }
    if (!this.hasLayer(this.markerLayer)) {
      this.addLayer(this.markerLayer);
    }
  }

  public hide(): void {
    if (this.hasLayer(this.tileLayer)) {
      this.removeLayer(this.tileLayer);
    }
    if (this.hasLayer(this.markerLayer)) {
      this.removeLayer(this.markerLayer);
    }
  }

  public addCategory(categoryName: string, layers: Layer[]): void {
    this.categories[categoryName] = layers;
    const bounds = this.map.getBounds();
    layers.forEach((l) => {
      this.updateLayerVisibility(l);
      l.updateMarkerVisibility(bounds);
    });
  }

  private getLocations() {
    const locations = [];
    for (const category of Object.values(this.categories)) {
      for (const layer of category) {
        if (layer.name !== "Locations") continue;
        for (const m of layer.markers) {
          if (!WSMarker.isLocation(m)) continue;
          locations.push(m);
        }
      }
    }
    return locations;
  }

  public filterLocations(shownValues: string[]) {
    const locations = this.getLocations();
    for (const loc of locations) {
      const filteredArray = shownValues.filter((value) =>
        loc.getKeywords().includes(value)
      );
      if (filteredArray.length > 0) {
        loc.forceShow();
      } else {
        loc.forceHide();
      }
    }
    this.updateMarkersVisibility();
  }

  public updateZoom(zoom: number): void {
    this.currentZoom = zoom;
    const bounds = this.map.getBounds().pad(0.2);
    for (const category of Object.values(this.categories)) {
      for (const layer of category) {
        this.updateLayerVisibility(layer);
        this.updateLayerMarkerVisibility(layer, bounds);
      }
    }
  }

  public resetMarkerVisibility(): void {
    const locations = this.getLocations();
    for (const loc of locations) {
      loc.resetVisibility();
    }
  }

  public updateMarkersVisibility(): void {
    const bounds = this.map.getBounds().pad(0.2);
    for (const category of Object.values(this.categories)) {
      for (const layer of category) {
        this.updateLayerMarkerVisibility(layer, bounds);
      }
    }
  }

  private updateLayerMarkerVisibility(
    layer: Layer,
    bounds: LatLngBounds
  ): void {
    layer.updateMarkerVisibility(bounds);
  }

  private updateLayerVisibility(layer: Layer): void {
    if (
      layer.visibility === Visibility.On ||
      (layer.visibility === Visibility.Default &&
        this.currentZoom >= layer.minZoom &&
        this.currentZoom <= layer.maxZoom)
    ) {
      this.markerLayer.addLayer(layer);
    } else {
      this.markerLayer.removeLayer(layer);
    }
  }

  public findLocationMarker(locationId: string) {
    let location: WSMarker | undefined;
    for (const [_, layers] of Object.entries(this.categories)) {
      for (const layer of layers) {
        layer.markers.forEach((marker) => {
          if (marker.id === locationId) {
            location = marker;
          }
        });
        if (location) break;
      }
    }
    if (location) {
      this.map.setView(location.coords, 3);
      location.openPopup();
    }
  }
}
