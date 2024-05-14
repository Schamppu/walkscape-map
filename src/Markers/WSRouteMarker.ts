import * as Schema from "../Interfaces/JSONSchema";
import { LatLngExpression } from "leaflet";
import { WSMarker } from "./WSMarker";
import { Layer } from "../Layer";

export class WSRouteMarker extends WSMarker {
  public id: string;
  public layer: Layer;

  public constructor(json: Schema.Route, coords: LatLngExpression, layer: Layer) {
    super(coords);

    this.id = json.id;
    this.layer = layer;
  }

  public static fromRouteJson(
    json: Schema.Route,
    layer: Layer
  ): WSRouteMarker {
    const marker = new WSRouteMarker(json, json.pathpoints[0], layer)
    return marker;
  }
}
