import * as Schema from "./JSONSchema";
import { LayerGroup, LatLngBounds } from "leaflet";
import { WSMarker } from "./WSMarker";
import { WSLocationMarker } from "./WSLocationMarker";

export enum Visibility {
  Off,
  On,
  Default,
}

export class Layer extends LayerGroup {
  public minZoom = 0;
  public maxZoom = Number.MAX_VALUE;
  public visibility = Visibility.Default;
  public markers!: WSMarker[];

  private constructor(public name: String) {
    super();
  }

  public static fromJson(json: Schema.Layer, categoryName: string): Layer {
    const layer = new Layer(json.name ?? categoryName);

    if (json.minZoom != undefined) {
      layer.minZoom = json.minZoom;
    }
    if (json.maxZoom != undefined) {
      layer.maxZoom = json.maxZoom;
    }

    layer.markers = json.markers.map((m) =>
      WSMarker.isLocation(m, layer)
        ? WSLocationMarker.fromJson(m, layer)
        : WSMarker.fromJson(m, layer)
    );

    return layer;
  }

  public forceShow(): void {
    this.setVisibility(Visibility.On);
  }

  public forceHide(): void {
    this.setVisibility(Visibility.Off);
  }

  public updateMarkerVisibility(bounds: LatLngBounds): void {
    this.markers.forEach((m) => m.updateVisibility(bounds));
  }

  private setVisibility(visibility: Visibility): void {
    this.visibility = visibility;
  }
}
