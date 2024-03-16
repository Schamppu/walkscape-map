import { Control, ControlPosition, DomUtil, DomEvent } from "leaflet";
import { ControlPane } from "./ControlPane";

export class ControlDock extends Control {
  private container: HTMLElement;
  private dock: HTMLElement;
  private group1: HTMLElement;
  private group2: HTMLElement;
  private group3: HTMLElement;
  private paneContainer: HTMLElement;
  private controls: ControlPane[] = [];

  public constructor() {
    super({
      position: "bottomleft",
    });

    this.container = DomUtil.create("aside", "ws-controls");
    this.dock = DomUtil.create("div", "ws-controls__dock", this.container);
    this.group1 = DomUtil.create("div", "ws-controls__dock__group", this.dock);
    this.group2 = DomUtil.create("div", "ws-controls__dock__group", this.dock);
    this.group3 = DomUtil.create("div", "ws-controls__dock__group", this.dock);
    this.paneContainer = DomUtil.create(
      "div",
      "ws-controls__pane-container",
      this.container
    );
    DomEvent.disableClickPropagation(this.container);
    DomEvent.disableScrollPropagation(this.container);
  }

  public onAdd(_map: L.Map): HTMLElement {
    return this.container;
  }

  public onRemove(_map: L.Map): void {
    // doesn't happen
  }

  public setPosition(position: ControlPosition): this {
    super.setPosition(position);
    switch (position) {
      case "bottomleft":
      case "topleft":
        this.container.insertBefore(this.dock, this.paneContainer);
        break;
      case "bottomright":
      case "topright":
        this.container.insertBefore(this.paneContainer, this.dock);
        break;
    }
    return this;
  }

  private showControl(control: ControlPane): void {
    for (const otherControl of this.controls) {
      if (otherControl != control) {
        otherControl.close();
      }
    }
    control.open();

    DomUtil.addClass(this.paneContainer, "visible");
  }
}
