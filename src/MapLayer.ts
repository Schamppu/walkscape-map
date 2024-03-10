import { LayerGroup, TileLayer } from "leaflet";
import { WSMap } from "./Map";

export class MapLayer extends LayerGroup {
  public tileLayer: TileLayer;
  private currentZoom = 1;

  public constructor(
    private map: WSMap,
    public layerName: string,
    private tileSize: number,
  ) {
    super();
    console.log('MapLayerConstructor called')
    this.tileLayer = new TileLayer(
      'tiles/{z}/{x}_{y}.png', {
        tileSize: tileSize,
        minZoom: 0,
        maxZoom: 2,
        noWrap: true,
      }
    )
  }

  public updateZoom(zoom: number): void {
    this.currentZoom = zoom;
  }
}