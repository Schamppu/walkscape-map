import * as Schema from "../JSONSchema";
import { DivIcon, Point, DomUtil } from "leaflet";

export interface NamedDivIcon {
  title: string;
  divIcon: DivIcon;
  labelDiv: HTMLElement;
}

export class MarkerDivIcon {
  public static create(json: Schema.Marker): NamedDivIcon;
  public static create(json: Schema.Location): NamedDivIcon {
    let title = json.name;
    if (json.hidden) title = "Unknown";

    const width = json.icon.width ?? 32;
    const height = json.icon.height ?? 32;

    const content = DomUtil.create("div", "marker-content-div");
    const image = new Image(width, height);
    image.src = json.hidden
      ? "icons/locations/unknown_1.png"
      : `icons/${json.icon.url}`;
    image.className = "marker-div-image";
    content.appendChild(image);

    const labelDiv = DomUtil.create("div", "visible", content);
    const labelStart = new Image();
    const labelEnd = new Image();
    labelStart.src = "icons/label_edge.png";
    labelEnd.src = "icons/label_edge.png";

    labelDiv.appendChild(labelStart);
    labelDiv.className = "marker-label-div";
    const label = DomUtil.create("span", "marker-div-span", labelDiv);
    label.textContent = title;
    labelDiv.appendChild(labelEnd);
    labelEnd.className = "marker-label-edge-end";

    const icon = new DivIcon({
      className: "marker-div-icon",
      iconSize: undefined,
      iconAnchor: new Point(0, height),
      html: content,
    });

    return { title, divIcon: icon, labelDiv };
  }
}
