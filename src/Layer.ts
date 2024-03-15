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
  public visibility = Visibility.Default;
  public markers!: WSMarker[];

  private constructor(public name: String) {
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

    const mapped: Schema.MappedLocation = {
      ...json,
      activities: [],
      buildings: [],
      services: [],
    };

    try {
      mapped["activities"] = json["activities"].map((v) => {
        const activity = activities.find((d) => d.id === v);
        if (activity === undefined) {
          throw new TypeError(`unable to find matching activity for ${v}`);
        }
        return activity;
      });
      mapped["buildings"] = json["buildings"].map((v) => {
        const building = buildings.find((d) => d.id === v);
        if (building === undefined) {
          throw new TypeError(`unable to find matching buildings for ${v}`);
        }
        return building;
      });
      mapped["services"] = json["services"].map((v) => {
        const service = services.find((d) => d.id === v);
        if (service === undefined) {
          throw new TypeError(`unable to find matching services for ${v}`);
        }
        return service;
      });
    } catch (e) {
      console.log(e);
    }

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

    layer.markers = json.markers.map((m) => {
      return WSMarker.isLocation(m)
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

  public updateMarkerVisibility(bounds: LatLngBounds): void {
    this.markers.forEach((m) => m.updateVisibility(bounds));
  }

  private setVisibility(visibility: Visibility): void {
    this.visibility = visibility;
  }
}
