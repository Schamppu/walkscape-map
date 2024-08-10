import { LatLngBounds, LayerGroup, TileLayer } from "leaflet";
import { WSMap } from "./WSMap";
import { Layer } from "./Layer";
import { Visibility } from "./Interfaces/Visibility";
import { WSMarker } from "./Markers/WSMarker";

export class MapLayer extends LayerGroup {
  public tileLayer: TileLayer;
  public markerLayer: LayerGroup;
  private categories: Record<string, Layer> = {};
  private currentZoom = 2;

  public constructor(
    private map: WSMap,
    public layerName: string,
    public displayName: string,
    public tilePath: string,
    public tileSize: number,
    bounds: LatLngBounds,
    public legacy: boolean
  ) {
    super();
    this.tileLayer = new TileLayer(`tiles/${tilePath}/{z}/{x}_{y}.png`, {
      tileSize: tileSize,
      minZoom: 0,
      maxZoom: map.getMaxZoom(),
      bounds: bounds,
      noWrap: true,
    });
    this.markerLayer = new LayerGroup();
  }

  public isVisible(): boolean {
    return this.hasLayer(this.tileLayer) || this.hasLayer(this.markerLayer);
  }

  public show(): void {
    if (!this.hasLayer(this.tileLayer)) {
      this.addLayer(this.tileLayer);
    }
    if (!this.hasLayer(this.markerLayer)) {
      this.addLayer(this.markerLayer);
    }
    this.updateZoom(this.map.getZoom());
  }

  public hide(): void {
    if (this.hasLayer(this.tileLayer)) {
      this.removeLayer(this.tileLayer);
    }
    if (this.hasLayer(this.markerLayer)) {
      this.removeLayer(this.markerLayer);
    }
  }

  public addCategory(categoryName: string, layer: Layer): void {
    this.categories[categoryName] = layer;
    const bounds = this.map.getBounds();
    this.updateLayerVisibility(layer);
    layer.updateMarkerVisibility(bounds);
  }

  private getMarkers() {
    const markers: WSMarker[] = [];
    for (const layer of Object.values(this.categories)) {
      for (const m of layer.markers) {
        markers.push(m);
      }
    }
    return markers;
  }

  public addRealmKeywords() {
    if (!("Realms" in this.categories) || !("Locations" in this.categories))
      return;
    const realms = this.categories["Realms"];
    const locations = this.categories["Locations"];
    for (const realm of realms.markers) {
      const { name } = realm;
      const locationsInRealm = locations.markers.filter((marker) => {
        if (WSMarker.isLocation(marker)) {
          return marker.realm === name.toLocaleLowerCase();
        }
      });
      const uniqueKeywords = [
        ...new Set(locationsInRealm.flatMap((l) => l.getKeywords())),
      ];
      realm.addKeywords(uniqueKeywords.filter((kw) => kw !== "location"));
    }
  }

  public filterLocations(shownValues: { [key: string]: Visibility }) {
    const locations = this.getMarkers();
    for (const loc of locations) {
      const visibilities = loc.getKeywords().map((kw) => shownValues[kw]);
      const visOn = visibilities.some((v) => v === Visibility.On);
      const visDefault = visibilities.some((v) => v === Visibility.Default);

      if (visOn) {
        loc.forceShow();
      } else if (visDefault) {
        loc.resetVisibility();
      } else {
        loc.forceHide();
      }
    }
    this.updateMarkersVisibility();
  }

  public filterRoutes(shownValues: { [key: string]: Visibility }) {
    if ("Routes" in this.categories) {
      const routeLayer = this.categories["Routes"];
      const routeVisiblity = shownValues["route"];

      if (routeVisiblity === Visibility.Off) {
        routeLayer.forceHide();
      } else {
        routeLayer.resetVisibility();
      }

      this.updateLayerVisibility(routeLayer);
    }
  }

  public updateZoom(zoom: number): void {
    if (!this.isVisible()) return;
    this.currentZoom = zoom;
    const bounds = this.map.getBounds().pad(0.2);
    for (const layer of Object.values(this.categories)) {
      this.updateLayerVisibility(layer);
      this.updateLayerMarkerVisibility(layer, bounds);
    }
  }

  public resetMarkerVisibility(): void {
    const locations = this.getMarkers();
    for (const loc of locations) {
      loc.resetVisibility();
    }
    this.updateMarkersVisibility();
  }

  public updateMarkersVisibility(): void {
    const bounds = this.map.getBounds().pad(0.2);
    for (const layer of Object.values(this.categories)) {
      this.updateLayerMarkerVisibility(layer, bounds);
    }
  }

  private updateLayerMarkerVisibility(
    layer: Layer,
    bounds: LatLngBounds
  ): void {
    if (!this.isVisible()) return;
    layer.updateMarkerVisibility(bounds);
  }

  private updateLayerVisibility(layer: Layer): void {
    if (!this.isVisible()) return;
    if (this.currentZoom >= layer.labelMinZoom) {
      layer.showLabels();
    } else {
      layer.hideLabels();
    }

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

  public findLocationMarker(locationId: string, openPopup: boolean = true) {
    let location: WSMarker | undefined;
    let zoomLevel = 3;
    for (const layer of Object.values(this.categories)) {
      layer.markers.forEach((marker) => {
        if (marker.id === locationId) {
          location = marker;
        }
      });
      if (location) {
        zoomLevel = Math.max(layer.minZoom, Math.min(layer.maxZoom, zoomLevel));
        break;
      }
    }
    if (location) {
      this.map.setView(location.coords, zoomLevel);
      if (openPopup) {
        location.openPopup();
      }
    }
  }
}
