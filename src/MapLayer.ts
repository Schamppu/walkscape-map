import { LatLngBounds, LayerGroup, TileLayer } from "leaflet";
import { WSMap } from "./WSMap";
import { Layer, Visibility } from "./Layer";

export class MapLayer extends LayerGroup {
  public tileLayer: TileLayer;
  public markerLayer: LayerGroup;
  private categories: Record<string, Layer[]> = {};
  private currentZoom = 1;

  public constructor(
    private map: WSMap,
    public layerName: string,
    private tileSize: number,
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
}
