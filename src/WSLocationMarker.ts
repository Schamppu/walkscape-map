import * as Schema from "./JSONSchema";
import { WSMarker } from "./WSMarker";
import { Layer } from "./Layer";
import { LatLngExpression } from "leaflet";

export class WSLocationMarker extends WSMarker {
  protected constructor(
    json: Schema.Location,
    coords: LatLngExpression,
    layer: Layer
  ) {
    super(json, coords, layer);
  }

  public static fromJson(
    json: Schema.Location,
    layer: Layer
  ): WSLocationMarker {
    const marker = new WSLocationMarker(json, json.coords, layer);
    return marker;
  }
}
