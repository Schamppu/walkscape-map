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
  private name: string;
  private icon: {
    url: string;
    width?: number | undefined;
    height?: number | undefined;
  };
  private realm: string;
  private activities: Schema.Activity[];
  private buildings: Schema.Building[];
  private services: Schema.Service[];

  private constructor(options: LocationPopupOptions) {
    super(options);
    this.name = options.name;
    this.icon = options.icon;
    this.realm = options.realm;
    this.activities = options.activities;
    this.buildings = options.buildings;
    this.services = options.services;

    this.container = DomUtil.create("div", "ws-location-popup");
    this.setContent(this.container);
  }

  public static create(options: LocationPopupOptions): LocationPopup {
    return new LocationPopup({
      ...options,
      minWidth: 350,
    });
  }

  public getPopupContent() {
    if (!this.container.hasChildNodes()) {
      this.createTitleContent();
      this.createBodyContent();
    }
    return this.container;
  }

  private createTitleContent() {
    const titleDiv = DomUtil.create(
      "div",
      "ws-location-popup__title-wrapper",
      this.container
    );
    const icon = new Image(16, 16);
    icon.src = `icons/${this.icon.url}`;
    icon.className = "ws-location-popup__title-icon";
    titleDiv.appendChild(icon);

    const title = DomUtil.create(
      "h2",
      `ws-location-popup__title ${this.realm}-color`,
      titleDiv
    );
    title.innerText = this.name;

    const divider = DomUtil.create(
      "div",
      `ws-location-popup__title-divider ${this.realm}-bg`,
      this.container
    );
    DomUtil.create("span", "", divider);
    DomUtil.create("span", "", divider);
  }

  private createBodyContent() {
    const createSubDiv = (name: string, parent: HTMLElement) => {
      const subDiv = DomUtil.create("div", "ws-location-popup__subdiv", parent);
      const subHeader = DomUtil.create(
        "p",
        "ws-location-popup__subheader",
        subDiv
      );
      subHeader.innerText = name;
      const subContentDiv = DomUtil.create(
        "div",
        `ws-location-popup__subcontent ${name}`,
        subDiv
      );
      return [subDiv, subContentDiv];
    };

    const body = DomUtil.create("div", "", this.container);

    const subContentDivs = ["activities", "services", "buildings"].map((v) => {
      const [_, subContentDiv] = createSubDiv(v, body);
      return subContentDiv;
    });

    const createSubContent = (
      parent: HTMLElement,
      data: Schema.DataPoint[]
    ) => {
      data.forEach((d) => {
        const dataDiv = DomUtil.create("div", "ws-location-popup__subdiv-content", parent);
        const img = new Image(d.icon.width ?? 32, d.icon.height ?? 32);
        img.src = `icons/${d.icon.url}`;
        dataDiv.appendChild(img);

        const text = DomUtil.create("p", "", dataDiv);
        text.innerText = d.name;
      });
    };

    createSubContent(subContentDivs[0], this.activities);
    createSubContent(subContentDivs[1], this.services);
    createSubContent(subContentDivs[2], this.buildings);
  }
}
