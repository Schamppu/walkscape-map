import * as Schema from "../JSONSchema";
import { Popup, PopupOptions, DomUtil } from "leaflet";

export interface LocationPopupOptions extends PopupOptions {
  id: string;
  name: string;
  realm: string;
  icon: {
    url: string;
    width?: number | undefined;
    height?: number | undefined;
  };
  activities: Schema.Activity[];
  buildings: Schema.Building[];
  services: Schema.Service[];
}

export class LocationPopup extends Popup {
  private container: HTMLElement;

  private constructor(options: LocationPopupOptions) {
    super(options);

    const createSubDiv = (name: string, parent: HTMLElement) => {
      const subDiv = DomUtil.create("div", "ws-location-popup__subdiv", parent);
      const subHeader = DomUtil.create(
        "span",
        "ws-location-popup__subheader",
        subDiv
      );
      subHeader.innerText = name;
      return subDiv;
    };

    this.container = DomUtil.create("div", "ws-location-popup");
    const titleDiv = DomUtil.create(
      "div",
      "ws-location-popup__title-wrapper",
      this.container
    );
    const icon = new Image(16, 16);
    icon.src = `icons/${options.icon.url}`;
    icon.className = "ws-location-popup__title-icon";
    titleDiv.appendChild(icon);

    const title = DomUtil.create(
      "h2",
      `ws-location-popup__title ${options.realm}-color`,
      titleDiv
    );
    title.innerText = options.name;

    const divider = DomUtil.create(
      "div",
      `ws-location-popup__title-divider ${options.realm}-bg`,
      this.container
    );
    DomUtil.create("span", "", divider);
    DomUtil.create("span", "", divider);

    ["Activities", "Buildings", "Services"].map((v) =>
      createSubDiv(v, this.container)
    );
    this.setContent(this.container);
  }

  public static create(options: LocationPopupOptions): LocationPopup {
    return new LocationPopup({
      ...options,
      minWidth: 200,
    });
  }
}
