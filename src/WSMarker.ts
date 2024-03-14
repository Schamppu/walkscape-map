import * as Schema from "./JSONSchema";
import { Marker, LatLngExpression, LatLngBounds } from "leaflet";
import { Layer } from "./Layer";
import { create } from "./MarkerDivIcon";

export class WSMarker extends Marker {
  public id: string;
  public name: string;
  public layer: Layer;

  protected constructor(
    json: Schema.Marker,
    coords: LatLngExpression,
    layer: Layer
  ) {
    const name = json.name ?? layer.name;
    let icon;
    if (json.icon) {
      icon = create(name, json);
    } else {
      icon = layer.icon;
    }

    super(coords, {
      title: json.name ?? layer.name,
      icon,
    });

    this.id = json.id;
    this.layer = layer;
    this.name = name;
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
    marker: Schema.Marker | Schema.Location,
    layer: Layer
  ): marker is Schema.Location {
    return layer.name === "Locations";
  }
}
