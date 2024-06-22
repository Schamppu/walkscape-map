import * as Schema from "../Interfaces/JSONSchema";
import { WSMarker } from "./WSMarker";
import { Layer } from "../Layer";
import { LocationPopup } from "../Popups/LocationPopup";
import { LatLngExpression } from "leaflet";

export class WSLocationMarker extends WSMarker {
  declare popup: LocationPopup;
  protected constructor(
    json: Schema.MappedLocation,
    public realm: string,
    keywords: string[],
    coords: LatLngExpression,
    layer: Layer
  ) {
    super(json, coords, layer);
    if (!this.hidden) {
      this.popup = LocationPopup.create({
        id: this.id,
        name: this.name,
        realm: json.realm,
        icon: json.icon,
        wikiUrl: json.wikiUrl,
        activities: json.activities,
        buildings: json.buildings,
        services: json.services,
      });
      this.realm = json.realm;
      this.bindPopup(this.popup);
      this.addKeywords(keywords);
    }
  }

  public static fromJson(
    json: Schema.MappedLocation,
    layer: Layer
  ): WSLocationMarker {
    const marker = new WSLocationMarker(
      json,
      json.realm,
      json.keywords,
      json.coords,
      layer
    );
    return marker;
  }
}
