import * as Schema from "../JSONSchema";
import { WSMarker } from "./WSMarker";
import { Layer } from "../Layer";
import { LocationPopup } from "./LocationPopup";
import { LatLngExpression } from "leaflet";

export class WSLocationMarker extends WSMarker {
  private popup: LocationPopup;

  protected constructor(
    json: Schema.Location,
    coords: LatLngExpression,
    layer: Layer
  ) {
    super(json, coords, layer);
    const popup = LocationPopup.create({
      id: this.id,
      name: this.name,
      realm: json.realm,
      icon: json.icon,
      activities: [],
      buildings: [],
      services: [],
    });
    this.popup = popup;
    this.bindPopup(this.popup);
  }

  public static fromJson(
    json: Schema.Location,
    layer: Layer
  ): WSLocationMarker {
    const marker = new WSLocationMarker(json, json.coords, layer);
    return marker;
  }
}
