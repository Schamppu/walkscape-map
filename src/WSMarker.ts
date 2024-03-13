import * as Schema from "./JSONSchema";
import {
  Marker,
  LatLngExpression,
  DivIcon,
  LatLngBounds,
  Point,
} from "leaflet";
import { Layer } from "./Layer";

const measureWidth = (el: HTMLElement) => {
  var pV = el.style.visibility,
    pP = el.style.position;

  el.style.visibility = "hidden";
  el.style.position = "absolute";

  document.body.appendChild(el);
  var result = el.offsetHeight;
  if (el.parentNode) el.parentNode.removeChild(el);

  el.style.visibility = pV;
  el.style.position = pP;
  return result;
};

export class WSMarker extends Marker {
  public id: string;
  public name: string;
  public layer: Layer;

  private constructor(
    json: Schema.Marker,
    coords: LatLngExpression,
    layer: Layer
  ) {
    const name = json.name ?? layer.name;
    let icon;
    if (json.icon) {
      const width = json.icon.width ?? 32;
      const height = json.icon.height ?? 32;

      // calculate element width for correct anchor position
      const content = document.createElement("div");
      const image = new Image(width, height);
      image.src = `icons/${json.icon.url}`;
      image.className = "marker-div-image";
      content.appendChild(image);

      const label = document.createElement("span");
      label.textContent = name;
      label.className = "marker-div-span";
      content.appendChild(label);

      const elementWidth = measureWidth(content);

      icon = new DivIcon({
        className: "marker-div-icon",
        iconSize: undefined,
        iconAnchor: new Point(elementWidth, height),
        html: content,
      });
    } else {
      icon = layer.icon;
    }

    super(coords, {
      title: json.name ?? layer.name,
      icon,
    });

    this.id = json.id;
    this.layer = layer;
    this.name = name;
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

  public isInBounds(bounds: LatLngBounds): boolean {
    return bounds.contains(this.getLatLng());
  }

  public updateVisibility(bounds: LatLngBounds): void {
    if (this.isInBounds(bounds)) this.show();
    else this.hide();
  }

  public static fromJson(json: Schema.Marker, layer: Layer): WSMarker {
    const marker = new WSMarker(json, json.coords, layer);
    return marker;
  }
}
