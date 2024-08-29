import * as Schema from "../Interfaces/JSONSchema";
import { Marker, LatLngExpression, LatLngBounds, DomUtil } from "leaflet";
import { Layer } from "../Layer";
import { Visibility } from "../Interfaces/Visibility";
import { MarkerDivIcon } from "./MarkerDivIcon";
import { WSLocationMarker } from "./WSLocationMarker";
import { WSRealmMarker } from "./WSRealmMarker";
import { WSPopup } from "../Popups/WSPopup";
import { URLResolver } from "../URLResolver";

export class WSMarker extends Marker {
  protected popup?: WSPopup;
  public id: string;
  public name: string;
  public layer: Layer;
  public hidden: boolean;
  public visibility = Visibility.Default;
  private labelDiv: HTMLElement;
  protected keywords: string[];

  protected constructor(
    json: Schema.Marker,
    public coords: LatLngExpression,
    layer: Layer
  ) {
    const { title, divIcon: icon, labelDiv } = MarkerDivIcon.create(json);

    super(coords, {
      title,
      icon,
    });

    this.id = json.id;
    this.layer = layer;
    this.name = title;
    this.labelDiv = labelDiv;

    this.hidden = json.hidden !== undefined ? json.hidden : false;

    if (this.layer.name == "Realms") this.keywords = ["realm"];
    else this.keywords = ["location"];

    this.on("popupopen", () => {
      if (this.popup) {
        const popupContent = this.popup.getPopupContent();
        this.setPopupContent(popupContent).openPopup();
        URLResolver.UpdateLocationURL(this.id, true);
      }
    });

    this.on("popupclose", () => {
      URLResolver.UpdateLocationURL(this.id, false);
    });
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

  public forceShow(): void {
    this.setVisibility(Visibility.On);
    if (this.hidden) {
      this.setVisibility(Visibility.Off);
    }
  }

  public forceHide(): void {
    this.setVisibility(Visibility.Off);
  }

  public resetVisibility(): void {
    this.setVisibility(Visibility.Default);
  }

  protected setVisibility(visibility: Visibility): void {
    this.visibility = visibility;
  }

  public showLabel(): void {
    if (DomUtil.hasClass(this.labelDiv, "hidden"))
      DomUtil.removeClass(this.labelDiv, "hidden");
    DomUtil.addClass(this.labelDiv, "visible");
  }

  public hideLabel(): void {
    if (DomUtil.hasClass(this.labelDiv, "visible"))
      DomUtil.removeClass(this.labelDiv, "visible");
    DomUtil.addClass(this.labelDiv, "hidden");
  }

  public isInBounds(bounds: LatLngBounds): boolean {
    return bounds.contains(this.getLatLng());
  }

  public updateVisibility(bounds: LatLngBounds): void {
    if (
      this.visibility === Visibility.On ||
      (this.visibility === Visibility.Default && this.isInBounds(bounds))
    )
      this.show();
    else this.hide();
  }

  public static fromJson(json: Schema.Marker, layer: Layer): WSMarker {
    const marker = new WSMarker(json, json.coords, layer);
    return marker;
  }

  public getKeywords() {
    return this.keywords;
  }

  public addKeywords(keywords: string[]) {
    this.keywords = this.keywords.concat(keywords);
  }

  public static isRealmJson(marker: Schema.Marker): marker is Schema.Realm {
    return Object.keys(marker).includes("motto");
  }

  public static isLocationJson(
    marker: Schema.Marker | Schema.Location
  ): marker is Schema.Location {
    return Object.keys(marker).includes("realm");
  }

  public static isRouteJson(
    marker: Schema.Marker | Schema.Route
  ): marker is Schema.Route {
    return Object.keys(marker).includes("pathpoints");
  }

  public static isRealm(marker: WSMarker): marker is WSRealmMarker {
    return Object.keys(marker).includes("motto");
  }

  public static isLocation(marker: WSMarker): marker is WSLocationMarker {
    return Object.keys(marker).includes("realm");
  }
}
