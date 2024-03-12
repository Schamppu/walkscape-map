import * as Schema from "./JSONSchema";
import { Marker, LatLngExpression, DivIcon, Point } from "leaflet";
import { Layer } from "./Layer";
import { MarkerContainer } from "./MarkerContainer";

export class WSMarker extends Marker {
  public id: string;
  public name: string;
  public layer: Layer;
  public tileContainers = <MarkerContainer[]>[];

  private constructor(
    json: Schema.Marker,
    coords: LatLngExpression,
    layer: Layer
  ) {
    const name = json.name ?? layer.name;
    let icon;
    if (json.icon) {
      icon = new DivIcon({
        className: "marker-div-icon",
        iconSize: undefined,
        html:
          `<img class="marker-div-image" src="icons/${json.icon.url}" width="${
            json.icon.width ?? 32
          }" height="${json.icon.height ?? 32}">` +
          `<span class="marker-div-span">${name}</span>`,
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

  public addToTileContainer(container: MarkerContainer): void {
    this.tileContainers.push(container);
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

  public static fromJson(json: Schema.Marker, layer: Layer): WSMarker {
    const marker = new WSMarker(json, json.coords, layer);
    return marker;
  }
}
