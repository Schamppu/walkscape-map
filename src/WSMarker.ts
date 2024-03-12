import * as Schema from "./JSONSchema";
import { Marker, LatLngExpression, Icon } from "leaflet";
import { Layer } from "./Layer";

export class WSMarker extends Marker {
  public id: string;
  public name: string;
  public layer: Layer;

  private constructor(
    json: Schema.Marker,
    coords: LatLngExpression,
    layer: Layer
  ) {
    let icon;
    if (json.icon) {
      icon = new Icon({
        iconUrl: `icons/${json.icon.url}`,
        iconSize: [json.icon.width ?? 32, json.icon.height ?? 32],
      });
    } else {
      icon = layer.icon;
    }

    super(coords, {
      title: json.name ?? layer.name,
      icon,
    });

    this.id = json.id;
    this.name = json.name ?? layer.name;
    this.layer = layer;
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

  public static fromJson(json: Schema.Marker, layer: Layer): WSMarker {
    const marker = new WSMarker(json, json.coords, layer);
    return marker;
  }
}
