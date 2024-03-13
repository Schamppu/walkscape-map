import * as Schema from "./JSONSchema";
import { DivIcon, Point } from "leaflet";

export function create(name: string, json: Schema.Marker): DivIcon {
  if (!json.icon) {
    json.icon = { url: "locations/unknown_1.png" };
  }

  const width = json.icon.width ?? 32;
  const height = json.icon.height ?? 32;

  // calculate element width for correct anchor position
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
  label.textContent = json.hidden ? "Unknown" : name;
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

  return icon;
}
