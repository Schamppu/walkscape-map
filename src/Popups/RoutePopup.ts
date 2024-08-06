import { WSPopup, WSPopupOptions } from "./WSPopup";
import { DomUtil, Point } from "leaflet";

export interface RoutePopupOptions extends WSPopupOptions {
  realm: string;
  distance: number;
  terrainModifiers: string;
}

export class RoutePopup extends WSPopup {
  private realm: string;
  private distance: number;
  private terrainModifiers: string;
  private constructor(options: RoutePopupOptions) {
    super(options);
    this.realm = options.realm;
    this.distance = options.distance;
    this.terrainModifiers = options.terrainModifiers;

    this.container = DomUtil.create("div", "ws-route-popup");
    this.setContent(this.container);
  }

  protected createPopupContent() {
    this.createTitleContent();
    this.createBodyContent();
  }

  private createTitleContent() {
    const titleDiv = DomUtil.create("div", "title-wrapper", this.container);
    const title = DomUtil.create("h2", `title color-${this.realm}`, titleDiv);
    title.innerText = this.name;

    const divider = DomUtil.create(
      "div",
      `title-divider bg-${this.realm}`,
      this.container
    );
    DomUtil.create("span", "", divider);
    DomUtil.create("span", "", divider);
  }

  private createBodyContent() {
    const body = DomUtil.create("div", "route-popup-body", this.container);
    const distance = DomUtil.create("div", "distance", body);
    const p1 = DomUtil.create("p", "distance-text", distance);
    p1.innerText = "Distance: ";

    const img = new Image(20, 20);
    img.src = `icons/activities/activity_sprites/agility/dasboot1.png`;
    distance.appendChild(img);

    const p2 = DomUtil.create("p", "distance-text", distance);
    p2.innerText = `${this.distance}`;

    if (this.terrainModifiers) {
      const modifiers = DomUtil.create("div", "modifiers", body);
      const p = DomUtil.create("p", "modifiers-text", modifiers);
      p.innerText = this.terrainModifiers;
    }
  }

  public static override create(options: RoutePopupOptions) {
    return new RoutePopup({
      ...options,
      minWidth: undefined,
    });
  }
}
