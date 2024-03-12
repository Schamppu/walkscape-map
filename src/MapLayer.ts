import {
  LatLngBounds,
  LayerGroup,
  TileLayer,
  Point,
  LeafletEvent,
} from "leaflet";
import { WSMap } from "./WSMap";
import { WSMarker } from "./WSMarker";
import { MarkerContainer } from "./MarkerContainer";
import { Layer, Visibility } from "./Layer";

export class MapLayer extends LayerGroup {
  public tileLayer: TileLayer;
  public markerLayer: LayerGroup;
  private categories: Record<string, Layer[]> = {};
  private tileMarkerContainers: MarkerContainer[][][] = [];
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

    for (let z = 0; z <= map.getMaxZoom(); ++z) {
      this.tileMarkerContainers[z] = [];
      for (let x = 0; x < Math.pow(2, z + 2); ++x) {
        this.tileMarkerContainers[z][x] = [];
        for (let y = 0; y < Math.pow(2, z + 1); ++y) {
          this.tileMarkerContainers[z][x][y] = new MarkerContainer();
        }
      }
    }

    this.tileLayer.on("tileload", (e: LeafletEvent) => {
      const te = <L.TileEvent>e;
      const container =
        this.tileMarkerContainers[te.coords.z][te.coords.x][te.coords.y];
      container.show();
      container.getMarkers().forEach(this.updateMarkerVisibility.bind(this));
    });
    this.tileLayer.on("tileunload", (e: LeafletEvent) => {
      const te = <L.TileEvent>e;
      const container =
        this.tileMarkerContainers[te.coords.z][te.coords.x][te.coords.y];
      container.hide();
      container.getMarkers().forEach(this.updateMarkerVisibility.bind(this));
    });
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
    layers.forEach((l) => {
      this.updateLayerVisibility(l);
      l.markers.forEach((m) => {
        this.addMarker(m, this.map.project(m.getLatLng(), 0));
      });
    });
  }

  public addMarker(marker: WSMarker, point: Point) {
    let isVisible = false;

    // add to tile containers
    for (let z = 0; z <= this.map.getMaxZoom(); ++z) {
      const x = Math.floor((point.x * Math.pow(2, z)) / this.tileSize);
      const y = Math.floor((point.y * Math.pow(2, z)) / this.tileSize);
      this.tileMarkerContainers[z][x][y].addMarker(marker);

      // marker is visible if tile container at ANY zoom level is visible
      if (this.tileMarkerContainers[z][x][y].isVisible()) {
        isVisible = true;
      }

      marker.addToTileContainer(this.tileMarkerContainers[z][x][y]);
    }

    if (isVisible) {
      marker.show();
    }
  }

  public updateZoom(zoom: number): void {
    this.currentZoom = zoom;
    for (const category of Object.values(this.categories)) {
      for (const layer of category) {
        this.updateLayerVisibility(layer);
      }
    }
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

  private updateMarkerVisibility(marker: WSMarker): void {
    if (marker.tileContainers.some((c) => c.isVisible())) {
      marker.show();
    } else {
      marker.hide();
    }
  }
}
