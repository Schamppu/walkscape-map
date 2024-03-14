import * as Schema from "../JSONSchema";
import { DivIcon, Point } from "leaflet";

export interface NamedDivIcon {
  title: string;
  divIcon: DivIcon;
}

export class MarkerDivIcon {
  public static create(json: Schema.Marker): NamedDivIcon;
  public static create(json: Schema.Location): NamedDivIcon {
    let title = json.name;
    if (json.hidden) title = "Unknown";

    const width = json.icon.width ?? 32;
    const height = json.icon.height ?? 32;

    const content = document.createElement("div");
    content.className = "marker-content-div";
    const image = new Image(width, height);
    image.src = json.hidden
      ? "icons/locations/unknown_1.png"
      : `icons/${json.icon.url}`;
    image.className = "marker-div-image";
    content.appendChild(image);

    const labelDiv = document.createElement("div");
    const labelStart = new Image();
    const labelEnd = new Image();
    labelStart.src = "icons/label_edge.png";
    labelEnd.src = "icons/label_edge.png";

    labelDiv.appendChild(labelStart);
    labelDiv.className = "marker-label-div";
    const label = document.createElement("span");
    label.textContent = title
    label.className = "marker-div-span";
    labelDiv.appendChild(label);
    labelDiv.appendChild(labelEnd);
    labelEnd.className = "marker-label-edge-end";

    content.appendChild(labelDiv);

    const icon = new DivIcon({
      className: "marker-div-icon",
      iconSize: undefined,
      iconAnchor: new Point(0, height),
      html: content,
    });

    return { title, divIcon: icon };
  }
}
