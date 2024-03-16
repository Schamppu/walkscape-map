import * as Schema from "../JSONSchema";
import { WSMarker } from "./WSMarker";
import { Layer } from "../Layer";
import { LocationPopup } from "./LocationPopup";
import { LatLngExpression } from "leaflet";

export class WSLocationMarker extends WSMarker {
  private popup?: LocationPopup;

  protected constructor(
    json: Schema.MappedLocation,
    coords: LatLngExpression,
    layer: Layer
  ) {
    super(json, coords, layer);
    if (!json.hidden) {
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
    }

    this.on("popupopen", () => {
      if (this.popup) {
        const popupContent = this.popup.getPopupContent();
        this.setPopupContent(popupContent).openPopup();
        this.updateUrl(true);
      }
    });

    this.on("popupclose", () => {
      this.updateUrl(false);
    });
  }

  public static fromJson(
    json: Schema.MappedLocation,
    layer: Layer
  ): WSLocationMarker {
    const marker = new WSLocationMarker(json, json.coords, layer);
    return marker;
  }

  private updateUrl(enable: boolean): void {
    const url = new URL(window.location.toString());
    if (enable) url.searchParams.set("l", this.id);
    else url.searchParams.delete("l");
    history.pushState({}, "", url);
  }
}
