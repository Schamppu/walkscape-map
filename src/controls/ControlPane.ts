import { DomEvent, DomUtil } from "leaflet";

export interface Options {
  icon: string;
  title: string;
}

/**
 * A pane that's attached to the control dock. Also defines the control's icon.
 */

export class ControlPane {
  protected container: HTMLElement;
  private button: HTMLElement;

  protected constructor(options: Options) {
    this.button = DomUtil.create("div", "ws-control__button");

    DomEvent.disableClickPropagation(this.button);
    DomEvent.disableScrollPropagation(this.button);

    this.container = DomUtil.create("div", "ws-control__pane");
  }

  public getButton(): HTMLElement {
    return this.button;
  }

  public getPane(): HTMLElement {
    return this.container;
  }

  public open(): void {
    DomUtil.addClass(this.button, "selected");
    DomUtil.addClass(this.container, "visible");
  }

  public close(): void {
    DomUtil.removeClass(this.button, "selected");
    DomUtil.removeClass(this.container, "visible");
  }
}
