import { FilterControl } from "./Controls/FilterControl";
import { MapLayer } from "./MapLayer";
import { WSMap } from "./WSMap";

export class URLResolver {
  private constructor(private map: WSMap) {}

  public static create(map: WSMap): URLResolver {
    return new URLResolver(map);
  }

  public static updateMapLayerURL(mapLayerName: string, mainLayerName: string) {
    const url = new URL(window.location.toString());
    if (mapLayerName !== mainLayerName) {
      url.searchParams.set("m", mapLayerName);
    } else {
      url.searchParams.delete("m");
    }
    history.pushState({}, "", url);
  }

  public static updateFilterURL(categoryName: string, enable: boolean) {
    const url = new URL(window.location.toString());
    if (categoryName == "None") url.searchParams.set("f", categoryName);
    else {
      url.searchParams.delete("f", "None");
      if (categoryName == "All") url.searchParams.delete("f");
      else if (enable) url.searchParams.append("f", categoryName);
      else url.searchParams.delete("f", categoryName);
    }
    history.pushState({}, "", url);
  }

  public static UpdateLocationURL(locationId: string, enable: boolean) {
    const url = new URL(window.location.toString());
    if (enable) url.searchParams.set("l", locationId);
    else url.searchParams.delete("l");
    history.pushState({}, "", url);
  }

  public resolveURL() {
    console.log("main.resolveURL");
    const urlParams = new URLSearchParams(window.location.search);

    const mapLayer = urlParams.get("m") || urlParams.get("mapLayer");
    const location = urlParams.get("l") || urlParams.get("location");
    const openPopup = !(urlParams.has("n") || urlParams.has("no-popup"));
    if (mapLayer && !location) {
      this.map.showLayer(mapLayer);
    } else {
      this.map.findMarker(mapLayer, location, openPopup);
    }

    const categoryNames = urlParams
      .getAll("f")
      .map((f) => f.toLocaleLowerCase());
    if (categoryNames) {
      this.map.resolveFilters(categoryNames);
    }
  }
}
