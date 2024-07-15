import { FilterControl } from "./Controls/FilterControl";
import { MapLayer } from "./MapLayer";
import { WSMap } from "./WSMap";

export class URLResolver {
  private constructor(private map: WSMap) {}

  public static create(map: WSMap): URLResolver {
    return new URLResolver(map);
  }

  public updateMapLayer(mapLayerName: string, mainLayerName: string) {
    console.log("updateMapLayer", mapLayerName);
    console.log(mapLayerName, mainLayerName);

    const url = new URL(window.location.toString());
    if (mapLayerName !== mainLayerName) {
      url.searchParams.set("m", mapLayerName);
    } else {
      url.searchParams.delete("m");
    }
    history.pushState({}, "", url);
  }

  public updateURL() {
    const urlParams = new URLSearchParams(window.location.search);

    const location = urlParams.get("l") || urlParams.get("location");
    console.log(location);
  }

  public resolveURL() {
    console.log("main.resolveURL");
    const urlParams = new URLSearchParams(window.location.search);

    const mapLayer = urlParams.get("m") || urlParams.get("mapLayer");
    const location = urlParams.get("l") || urlParams.get("location");
    const openPopup = !(urlParams.has("n") || urlParams.has("no-popup"));
    const categoryNames = urlParams
      .getAll("f")
      .map((f) => f.toLocaleLowerCase());

    if (mapLayer && !location) {
      this.map.showLayer(mapLayer);
    } else {
      this.map.findMarker(mapLayer, location, openPopup);
    }
  }
}
