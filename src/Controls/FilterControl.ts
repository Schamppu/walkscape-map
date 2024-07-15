import { DomUtil, DomEvent } from "leaflet";
import { ControlPane } from "./ControlPane";
import { MapLayer } from "../MapLayer";
import { FilterCategory } from "../Interfaces/FilterCategory";
import { URLResolver } from "../URLResolver";

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
  private shownValues: string[] = [];

  public constructor(private mapLayers: MapLayer[]) {
    super({
      icon: "filter",
      title: "Filter",
    });

    DomUtil.create("h3", "", this.container).innerText = "Filter Locations";

    this.allNoneUL = DomUtil.create("ul", "tabs", this.container);
    this.all = DomUtil.create("li", "tab selectable", this.allNoneUL);
    this.all.innerText = "All";
    this.none = DomUtil.create("li", "tab selectable", this.allNoneUL);
    this.none.innerText = "None";

    DomUtil.addClass(this.all, "selected");

    DomEvent.addListener(this.all, "click", () => {
      this.showAll();
    });

    DomEvent.addListener(this.none, "click", () => {
      this.showNone();
    });

    this.categoryList = DomUtil.create("ul", "categories", this.container);
  }

  public addGroup(name: string) {
    const groupLi = DomUtil.create("li", "group", this.categoryList);

    const groupHeader = DomUtil.create("div", "header", groupLi);
    const groupHeaderDropdown = DomUtil.create("p", "dropdown", groupHeader);
    groupHeaderDropdown.classList.add("toggleable");
    groupHeaderDropdown.innerText = "▼";
    DomUtil.addClass(groupHeaderDropdown, "toggled-on");

    const groupHeaderTitle = DomUtil.create("p", "title", groupHeader);
    groupHeaderTitle.classList.add("toggleable");
    groupHeaderTitle.innerText = name;
    groupHeaderTitle.style.textAlign = "center";
    groupHeaderTitle.style.fontWeight = "bold";

    const groupBody = DomUtil.create("ul", "group-body", groupLi);
    DomUtil.addClass(groupBody, "visible");

    const groupItem = { name, li: groupBody };
    this.groupList.push(groupItem);

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
    return groupItem;
  }

  public addCategory(category: FilterCategory, group: string) {
    let groupItem = this.groupList.find((g) => g.name === group);
    if (groupItem === undefined) {
      groupItem = this.addGroup(group);
    }
    const groupLi = groupItem.li;

    const li = DomUtil.create("li", "legend-item selectable", groupLi);
    const div = DomUtil.create("div", "legend-item-content", li);
    const icon = DomUtil.create("img", "", div);

    const label = DomUtil.create("p", "label", div);
    label.innerText = category.name;
    icon.src = category.iconUrl;
    const iconSize = 32;
    icon.style.width = iconSize + "px";
    icon.style.height = iconSize + "px";

    this.categories.push({ category, li });
    this.shownValues.push(...category.values);

    DomEvent.addListener(li, "click", () => {
      if (DomUtil.hasClass(li, "selected")) {
        this.disableFilter({ category, li });
      } else {
        this.enableFilter({ category, li });
      }
      this.filterLocations();
    });
  }

  public reset(): void {
    this.showAll();
  }

  private disableFilter(item: LegendItem) {
    const { category, li } = item;
    DomUtil.removeClass(li, "selected");
    this.shownValues = this.shownValues.filter(
      (el) => !category.values.includes(el)
    );
    URLResolver.updateFilterURL(category.name, false);

    // select "All" if no others are selected
    if (this.categories.every((c) => !DomUtil.hasClass(c.li, "selected"))) {
      this.showAll();
    }
    this.filterLocations();
  }

  private enableFilter(item: LegendItem, urlUpdate = true) {
    const { category, li } = item;
    DomUtil.addClass(li, "selected");
    this.shownValues.push(...category.values);
    if (urlUpdate) URLResolver.updateFilterURL(category.name, true);

    // hide the others
    if (DomUtil.hasClass(this.all, "selected")) {
      DomUtil.removeClass(this.all, "selected");
      this.shownValues = [...category.values];
    }
    DomUtil.removeClass(this.none, "selected");
    this.filterLocations();
  }

  private filterLocations(): void {
    this.mapLayers.forEach((l) => l.filterLocations(this.shownValues));
  }

  private showAll(): void {
    if (!DomUtil.hasClass(this.all, "selected")) {
      DomUtil.addClass(this.all, "selected");
      DomUtil.removeClass(this.none, "selected");
      this.categories.forEach((c) => {
        this.shownValues.push(...c.category.values);
        DomUtil.removeClass(c.li, "selected");
      });
    }
    this.mapLayers.forEach((l) => {
      l.filterLocations(this.shownValues);
      l.resetMarkerVisibility();
    });
    URLResolver.updateFilterURL("All", true);
  }

  private showNone(): void {
    if (!DomUtil.hasClass(this.none, "selected")) {
      DomUtil.addClass(this.none, "selected");
      DomUtil.removeClass(this.all, "selected");
      this.shownValues = [];
      this.categories.forEach((c) => {
        DomUtil.removeClass(c.li, "selected");
      });
    }
    this.mapLayers.forEach((l) => l.filterLocations(this.shownValues));
    URLResolver.updateFilterURL("None", true);
  }

  public resolveFromUrl(categoryNames: string[]): void {
    if (categoryNames.includes("none")) {
      this.showNone();
      return;
    }

    const categories = this.categories.filter(({ category }) =>
      categoryNames.includes(category.name.toLocaleLowerCase())
    );
    categories.forEach((c) => this.enableFilter(c, false));
  }
}
