import { ControlPane } from "./ControlPane";
import { MapLayer } from "../MapLayer";

/**
 * Control that allows the user to filter which location markers are visible
 */
export class FilterControl extends ControlPane {
  public constructor(private mapLayers: MapLayer[]) {
    super({
      icon: "filter",
      title: "Filter",
    });
  }
}
