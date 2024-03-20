import { DomEvent, DomUtil } from "leaflet";

export interface Options {
  minZoom: number;
  maxZoom: number;
  initialZoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
}
/**
 * Set of controls for toggling which layer is visible
 */
export class ZoomControl {
  private container: HTMLElement;
  private zoomInBtn: HTMLElement;
  private zoomOutBtn: HTMLElement;

  public constructor(private options: Options) {
    this.container = DomUtil.create("div", "ws-control__button-group");

    this.zoomOutBtn = DomUtil.create(
      "div",
      "ws-control__button zoom",
      this.container
    );
    const zoomOutBtnText = DomUtil.create(
      "p",
      "ws-control__button-text",
      this.zoomOutBtn
    );
    zoomOutBtnText.innerText = "-";
    zoomOutBtnText.title = "Zoom out";
    if (options.initialZoom <= options.minZoom) {
      DomUtil.addClass(this.zoomOutBtn, "disabled");
    }
    DomEvent.on(this.zoomOutBtn, "click", () => {
      if (!DomUtil.hasClass(this.zoomOutBtn, "disabled")) {
        options.zoomOut();
      }
    });

    this.zoomInBtn = DomUtil.create(
      "div",
      "ws-control__button zoom",
      this.container
    );
    const zoomInBtnText = DomUtil.create(
      "p",
      "ws-control__button-text",
      this.zoomInBtn
    );
    zoomInBtnText.innerText = "+";
    zoomInBtnText.title = "Zoom in";
    if (options.initialZoom >= options.maxZoom) {
      DomUtil.addClass(this.zoomInBtn, "disabled");
    }
    DomEvent.on(this.zoomInBtn, "click", () => {
      if (!DomUtil.hasClass(this.zoomInBtn, "disabled")) {
        options.zoomIn();
      }
    });
  }

  public getButtons(): HTMLElement {
    return this.container;
  }

  public setZoom(zoom: number) {
    if (zoom >= this.options.maxZoom) {
      DomUtil.addClass(this.zoomInBtn, "disabled");
    } else {
      DomUtil.removeClass(this.zoomInBtn, "disabled");
    }

    if (zoom <= this.options.minZoom) {
      DomUtil.addClass(this.zoomOutBtn, "disabled");
    } else {
      DomUtil.removeClass(this.zoomOutBtn, "disabled");
    }
  }
}
