import * as Schema from "../JSONSchema";
import { Marker, LatLngExpression, LatLngBounds } from "leaflet";
import { Layer } from "../Layer";
import { MarkerDivIcon } from "./MarkerDivIcon";

export class WSMarker extends Marker {
  public id: string;
  public name: string;
  public layer: Layer;

  protected constructor(
    json: Schema.Marker,
    coords: LatLngExpression,
    layer: Layer
  ) {
    const { title, divIcon: icon } = MarkerDivIcon.create(json);

    super(coords, {
      title,
      icon,
    });

    this.id = json.id;
    this.layer = layer;
    this.name = title;
  }

  public show(): void {
    if (this.layer) {
      this.addTo(this.layer);
    }
  }

  public hide(): void {
    if (this.layer) {
      this.layer.removeLayer(this);
    }
  }

  public isInBounds(bounds: LatLngBounds): boolean {
    return bounds.contains(this.getLatLng());
  }

  public updateVisibility(bounds: LatLngBounds): void {
    if (this.isInBounds(bounds)) this.show();
    else this.hide();
  }

  public static fromJson(json: Schema.Marker, layer: Layer): WSMarker {
    const marker = new WSMarker(json, json.coords, layer);
    return marker;
  }

  public static isLocation(
    marker: Schema.Marker | Schema.Location
  ): marker is Schema.Location {
    return Object.keys(marker).includes("realm");
  }
}
