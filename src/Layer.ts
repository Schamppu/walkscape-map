import * as Schema from "./Interfaces/JSONSchema";
import { LayerGroup, LatLngBounds, Polyline } from "leaflet";
import { WSMarker } from "./Markers/WSMarker";
import { WSLocationMarker } from "./Markers/WSLocationMarker";
import { DataPoint } from "./Interfaces/DataPoint";
import { WSRealmMarker } from "./Markers/WSRealmMarker";
import { RoutePopup } from "./Popups/RoutePopup";

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
      hidden: json.hidden !== undefined ? json.hidden : false,
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
    const layer = new Layer(categoryName);

    if (json.minZoom != undefined) {
      layer.minZoom = json.minZoom;
    }
    if (json.maxZoom != undefined) {
      layer.maxZoom = json.maxZoom;
    }
    layer.labelMinZoom =
      json.labelMinZoom != undefined ? json.labelMinZoom : layer.minZoom;

    layer.markers = json.markers
      .filter(
        (m) =>
          (WSMarker.isLocationJson(m) || WSMarker.isRealmJson(m)) &&
          !WSMarker.isRouteJson(m)
      )
      .map((m) => {
        if (WSMarker.isLocationJson(m))
          return WSLocationMarker.fromJson(
            this.matchDataPointsToJson(m, data),
            layer
          );
        if (WSMarker.isRealmJson(m)) return WSRealmMarker.fromJson(m, layer);
        return WSMarker.fromJson(m, layer);
      });

    json.markers.forEach((m) => {
      if (WSMarker.isRouteJson(m)) {
        const routes = this.createRoute(m);
        routes.forEach((r) => {
          layer.addLayer(r);
        });
      }
    });

    return layer;
  }

  private static createRoute(json: Schema.Route): Polyline[] {
    const colors: Record<string, string> = {
      jarvonia: "#abddff",
      wallisia: "#ff9b74",
      gdte: "#a9ff6a",
      galeforge: "#fbaaff",
      wrentmark: "#f8ff9f",
      painful_islands: "#ff2f15",
      ewerethien: "#d4b4ff",
      braemercia: "#ffa25f",
      rid_raddak: "#c3ff1f",
      ethereal: "#ff608c",
    };

    const lineOptions = {
      color: colors[json.realm],
      opacity: 1,
      weight: 4,
      dashOffset: "40",
      dashArray: "1,30",
    };

    const lines: Polyline[] = [];
    const weight_start = 20;
    const weight_offset = -3;
    const used_colors = ["white", "gray", "black", colors[json.realm]];

    const popup = RoutePopup.create(json);

    for (var i = 0; i < used_colors.length; i++) {
      const route = new Polyline(json.pathpoints, {
        ...lineOptions,
        weight: weight_start + i * weight_offset,
        color: used_colors[i],
      });
      route.bindPopup(popup);
      route.on("click", (e) => {
        const clickedLatLng = e.latlng;
        const popupContent = popup.getPopupContent();
        route.setPopupContent(popupContent).openPopup(clickedLatLng);
      });
      lines.push(route);
    }
    return lines;
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
