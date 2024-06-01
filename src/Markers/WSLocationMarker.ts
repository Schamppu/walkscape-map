import * as Schema from "../JSONSchema";
import { WSMarker } from "./WSMarker";
import { Layer, Visibility } from "../Layer";
import { LocationPopup } from "./LocationPopup";
import { LatLngExpression } from "leaflet";

export class WSLocationMarker extends WSMarker {
  private popup?: LocationPopup;

  protected constructor(
    json: Schema.MappedLocation,
    public hidden: boolean,
    public realm: string,
    keywords: string[],
    coords: LatLngExpression,
    layer: Layer
  ) {
    super(json, coords, layer);
    if (!this.hidden) {
      const popup = LocationPopup.create({
        id: this.id,
        name: this.name,
        realm: json.realm,
        icon: json.icon,
        wikiUrl: json.wikiUrl,
        activities: json.activities,
        buildings: json.buildings,
        services: json.services,
      });
      this.popup = popup;
      this.realm = json.realm;
      this.bindPopup(this.popup);
      this.addKeywords(keywords);
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
    const marker = new WSLocationMarker(
      json,
      json.hidden,
      json.realm,
      json.keywords,
      json.coords,
      layer
    );
    return marker;
  }

  private updateUrl(enable: boolean): void {
    const url = new URL(window.location.toString());
    if (enable) url.searchParams.set("l", this.id);
    else url.searchParams.delete("l");
    history.pushState({}, "", url);
  }

  public forceShow(): void {
    this.setVisibility(Visibility.On);
    if (this.hidden) {
      this.setVisibility(Visibility.Off);
    }
  }
}
