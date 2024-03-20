import * as Schema from "./JSONSchema";
import { LayerGroup, LatLngBounds } from "leaflet";
import { WSMarker } from "./Markers/WSMarker";
import { WSLocationMarker } from "./Markers/WSLocationMarker";
import { DataPoint } from "./DataPoint";

export enum Visibility {
  Off,
  On,
  Default,
}

export class Layer extends LayerGroup {
  public minZoom = 0;
  public maxZoom = Number.MAX_VALUE;
  public labelMinZoom = 0;
  public visibility = Visibility.Default;
  public markers!: WSMarker[];

  private constructor(public name: string) {
    super();
  }

  private static matchDataPointsToJson(
    json: Schema.Location,
    data: Schema.DataPoint[][]
  ): Schema.MappedLocation {
    const activities: Schema.Activity[] = DataPoint.isActivities(data[0])
      ? data[0]
      : [];
    const buildings: Schema.Building[] = DataPoint.isBuildings(data[1])
      ? data[1]
      : [];
    const services: Schema.Service[] = DataPoint.isServices(data[2])
      ? data[2]
      : [];

    const aj = json["activities"];
    const bj = json["buildings"];
    const sj = json["services"];

    const mapped: Schema.MappedLocation = {
      ...json,
      activities: [],
      buildings: [],
      services: [],
      keywords: [],
    };

    try {
      aj.forEach((v) => {
        const activity = activities.find((d) => d.id === v);
        if (activity === undefined) {
          throw new TypeError(`unable to find matching activity for ${v}`);
        }
        mapped["activities"].push(activity);
        mapped["keywords"] = mapped["keywords"].concat(activity["skills"]);
      });
      bj.forEach((v) => {
        const building = buildings.find((d) => d.id === v);
        if (building === undefined) {
          throw new TypeError(`unable to find matching buildings for ${v}`);
        }
        mapped["buildings"].push(building);
        mapped["keywords"].push(building["type"]);
      });
      sj.forEach((v) => {
        const service = services.find((d) => d.id === v);
        if (service === undefined) {
          throw new TypeError(`unable to find matching services for ${v}`);
        }
        mapped["services"].push(service);
        mapped["keywords"].push(service["id"]);
      });
    } catch (e) {
      console.log(e);
    }

    mapped["keywords"] = [...new Set(mapped["keywords"])];
    return mapped;
  }

  public static fromJson(
    json: Schema.Layer,
    categoryName: string,
    data: Schema.DataPoint[][]
  ): Layer {
    const layer = new Layer(json.name ?? categoryName);

    if (json.minZoom != undefined) {
      layer.minZoom = json.minZoom;
    }
    if (json.maxZoom != undefined) {
      layer.maxZoom = json.maxZoom;
    }
    layer.labelMinZoom =
      json.labelMinZoom != undefined ? json.labelMinZoom : layer.minZoom;

    layer.markers = json.markers.map((m) => {
      return WSMarker.isLocationJson(m)
        ? WSLocationMarker.fromJson(this.matchDataPointsToJson(m, data), layer)
        : WSMarker.fromJson(m, layer);
    });

    return layer;
  }

  public forceShow(): void {
    this.setVisibility(Visibility.On);
  }

  public forceHide(): void {
    this.setVisibility(Visibility.Off);
  }

  public showLabels(): void {
    this.markers.forEach((m) => m.showLabel());
  }

  public hideLabels(): void {
    this.markers.forEach((m) => m.hideLabel());
  }

  public updateMarkerVisibility(bounds: LatLngBounds): void {
    this.markers.forEach((m) => m.updateVisibility(bounds));
  }

  private setVisibility(visibility: Visibility): void {
    this.visibility = visibility;
  }
}
