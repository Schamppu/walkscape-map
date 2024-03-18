import { DomUtil, DomEvent } from "leaflet";
import { ControlPane } from "./ControlPane";
import { MapLayer } from "../MapLayer";
import { FilterCategory } from "../FilterCategory";

interface LegendItem {
  category: FilterCategory;
  li: HTMLElement;
}

interface GroupItem {
  name: string;
  li: HTMLElement;
}

/**
 * Control that allows the user to filter which location markers are visible
 */
export class FilterControl extends ControlPane {
  private all: HTMLElement;
  private none: HTMLElement;
  private allNoneUL: HTMLElement;
  private categoryList: HTMLElement;
  private categories = <LegendItem[]>[];
  private groupList = <GroupItem[]>[];

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

    this.categoryList = DomUtil.create(
      "ul",
      "ws-legend__categories",
      this.container
    );
  }

  public addGroup(name: string) {
    const groupLi = DomUtil.create("li", "ws-legend-group", this.categoryList);

    const groupDiv = DomUtil.create("div", "ws-legend-group__div", groupLi);
    const groupHeader = DomUtil.create(
      "div",
      "ws-legend-group__header",
      groupDiv
    );
    const groupHeaderDropdown = DomUtil.create(
      "p",
      "ws-legend-group__dropdown",
      groupHeader
    );
    groupHeaderDropdown.classList.add("toggleable");
    groupHeaderDropdown.innerText = "▼";
    DomUtil.addClass(groupHeaderDropdown, "toggled-on");

    const groupHeaderTitle = DomUtil.create(
      "p",
      "ws-legend-group__title",
      groupHeader
    );
    groupHeaderTitle.classList.add("toggleable");
    groupHeaderTitle.innerText = name;
    groupHeaderTitle.style.textAlign = "center";
    groupHeaderTitle.style.fontWeight = "bold";

    const groupBody = DomUtil.create("ul", "ws-legend-group__body", groupDiv);
    DomUtil.addClass(groupBody, "visible");

    this.groupList.push({ name, li: groupLi });

    //Add click event to group for dropdown functionality
    DomEvent.addListener(groupHeader, "click", () => {
      //Check if group is selected
      if (DomUtil.hasClass(groupHeaderDropdown, "toggled-on")) {
        //Toggle group off
        DomUtil.removeClass(groupHeaderDropdown, "toggled-on");
        groupHeaderDropdown.innerText = "▶";
        DomUtil.removeClass(groupBody, "visible");
      } else {
        //Toggle group on
        DomUtil.addClass(groupHeaderDropdown, "toggled-on");
        groupHeaderDropdown.innerText = " ▼";
        DomUtil.addClass(groupBody, "visible");
      }
    });
  }

  public addCategory(category: FilterCategory, group: string) {
    if (!this.groupList.some((g) => g.name === group)) {
      this.addGroup(group);
    }
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
