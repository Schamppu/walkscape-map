import * as Schema from "../JSONSchema";
import { WSMarker } from "./WSMarker";
import { Layer } from "../Layer";
import { LocationPopup } from "./LocationPopup";
import { LatLngExpression } from "leaflet";

export class WSLocationMarker extends WSMarker {
  private popup: LocationPopup;

  protected constructor(
    json: Schema.MappedLocation,
    coords: LatLngExpression,
    layer: Layer
  ) {
    super(json, coords, layer);
    const popup = LocationPopup.create({
      id: this.id,
      name: this.name,
      realm: json.realm,
      icon: json.icon,
      activities: json.activities,
      buildings: json.buildings,
      services: json.services,
    });
    this.popup = popup;
    this.bindPopup(this.popup);

    this.on('click', () => {
      const popupContent = this.popup.getPopupContent()
      this.setPopupContent(popupContent).openPopup()
    })
  }

  public static fromJson(
    json: Schema.MappedLocation,
    layer: Layer
  ): WSLocationMarker {
    const marker = new WSLocationMarker(json, json.coords, layer);
    return marker;
  }
}
