import * as Schema from "../JSONSchema";
import { Marker, LatLngExpression, LatLngBounds, DomUtil } from "leaflet";
import { Layer, Visibility } from "../Layer";
import { MarkerDivIcon } from "./MarkerDivIcon";
import { WSLocationMarker } from "./WSLocationMarker";

export class WSMarker extends Marker {
  public id: string;
  public name: string;
  public layer: Layer;
  public visibility = Visibility.Default;
  private labelDiv: HTMLElement;

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

  public static isLocationJson(
    marker: Schema.Marker | Schema.Location
  ): marker is Schema.Location {
    return Object.keys(marker).includes("realm");
  }

  public static isLocation(marker: WSMarker): marker is WSLocationMarker {
    return Object.keys(marker).includes("keywords");
  }
}
