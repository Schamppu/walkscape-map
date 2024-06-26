import * as Schema from "../Interfaces/JSONSchema";
import { DivIcon, Point, DomUtil } from "leaflet";

export interface NamedDivIcon {
  title: string;
  divIcon: DivIcon;
  labelDiv: HTMLElement;
}

export class MarkerDivIcon {
  public static create(json: Schema.Marker): NamedDivIcon;
  public static create(json: Schema.Location): NamedDivIcon {
    let title = json.name ?? null;
    if (json.hidden) title = "Unknown";

    const content = DomUtil.create("div", "marker-content");
    let height = 0;

    if (json.icon) {
      const width = json.icon.width ?? 32;
      height = json.icon.height ?? 32;
      const image = new Image(width, height);
      image.src = json.hidden
        ? "icons/locations/unknown_1.png"
        : `icons/${json.icon.url}`;
      content.appendChild(image);
    }

    const labelDiv = DomUtil.create("div", "visible", content);
    const labelStart = new Image();
    const labelEnd = new Image();
    labelStart.src = "icons/label_edge.png";
    labelEnd.src = "icons/label_edge.png";

    labelDiv.appendChild(labelStart);
    labelDiv.className = "label-div";
    const label = DomUtil.create("span", "label", labelDiv);
    label.textContent = title;
    labelDiv.appendChild(labelEnd);
    labelEnd.className = "label-edge-end";

    const icon = new DivIcon({
      className: "div-icon",
      iconSize: undefined,
      iconAnchor: new Point(0, height),
      html: content,
    });

    return { title, divIcon: icon, labelDiv };
  }
}
