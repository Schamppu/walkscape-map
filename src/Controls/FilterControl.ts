import { DomUtil, DomEvent } from "leaflet";
import { ControlPane } from "./ControlPane";
import { MapLayer } from "../MapLayer";

/**
 * Control that allows the user to filter which location markers are visible
 */
export class FilterControl extends ControlPane {
  private all: HTMLElement;
  private none: HTMLElement;
  private allNoneUL: HTMLElement;

  public constructor(private mapLayers: MapLayer[]) {
    super({
      icon: "filter",
      title: "Filter",
    });

    DomUtil.create("h3", "ws-control__title", this.container).innerText =
      "Filter Locations";

    this.allNoneUL = DomUtil.create("ul", "ws-tabs", this.container);
    this.all = DomUtil.create("li", "ws-tab selectable", this.allNoneUL);
    this.all.innerText = "All";
    this.none = DomUtil.create("li", "ws-tab selectable", this.allNoneUL);
    this.none.innerText = "None";

    DomUtil.addClass(this.all, "selected");

    DomEvent.addListener(this.all, "click", () => {
      this.showAll();
    });

    DomEvent.addListener(this.none, "click", () => {
      this.showNone();
    });

    // this.categoryList = DomUtil.create(
    //     "ul",
    //     "ws-legend__categories",
    //     this.container
    //   );
  }
  
  public reset(): void {
    this.showAll();
  }

  private showAll(): void {
    if (!DomUtil.hasClass(this.all, "selected")) {
      DomUtil.addClass(this.all, "selected");
      DomUtil.removeClass(this.none, "selected");
      //   this.categories.forEach((c) => {
      //     DomUtil.removeClass(c.li, "selected");
      //     this.mapLayers.forEach((l) =>
      //       l.resetCategoryVisibility(c.category.name)
      //     );
      //   });
    }
  }

  private showNone(): void {
    if (!DomUtil.hasClass(this.none, "selected")) {
      DomUtil.addClass(this.none, "selected");
      DomUtil.removeClass(this.all, "selected");
      //   this.categories.forEach((c) => {
      //     DomUtil.removeClass(c.li, "selected");
      //     this.mapLayers.forEach((l) => l.hideCategory(c.category.name));
      //   });
    }
  }
}
