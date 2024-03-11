import { LatLngBounds, LayerGroup, TileLayer, Point } from "leaflet";
import { WSMap } from "./WSMap";
import { WSMarker } from "./WSMarker";
import { Layer, Visibility } from "./Layer";

export class MapLayer extends LayerGroup {
  public tileLayer: TileLayer;
  public markerLayer: LayerGroup;
  private categories: Record<string, Layer[]> = {};
  private currentZoom = 2;

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
    console.log(layers);
    layers.forEach((l) => {
      l.forceShow();
      this.updateLayerVisibility(l);
      l.markers.forEach((m) => {
        this.addMarker(m, this.map.project(m.getLatLng(), 0));
      });
    });
  }

  public addMarker(marker: WSMarker, point: Point) {
    marker.show();
  }

  private updateLayerVisibility(layer: Layer): void {
    if (
      layer.visibility === Visibility.On ||
      (layer.visibility === Visibility.Default &&
        this.currentZoom >= layer.minZoom &&
        this.currentZoom <= layer.maxZoom)
    ) {
      this.markerLayer.addLayer(layer);
      console.log("add markerLayer");
    } else {
      this.markerLayer.removeLayer(layer);
    }
  }
}
