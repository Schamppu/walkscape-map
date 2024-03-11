import { LatLngBounds, LayerGroup, TileLayer } from "leaflet";
import { WSMap } from "./WSMap";

export class MapLayer extends LayerGroup {
  public tileLayer: TileLayer;

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
  }

  public show(): void {
    if (!this.hasLayer(this.tileLayer)) {
      this.addLayer(this.tileLayer);
    }
  }
}
