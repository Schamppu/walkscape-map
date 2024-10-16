import { DomUtil, DomEvent } from "leaflet";
import { ControlPane } from "./ControlPane";
import { MapLayer } from "../MapLayer";
import { URLResolver } from "../URLResolver";

interface LayerItem {
  name: string;
  layer: MapLayer;
  li: HTMLElement;
}

export class LayersControl extends ControlPane {
  private layerList: LayerItem[];
  private layerWrapper: HTMLElement;
  private layerContainer: HTMLElement;
  private legacyContainer: HTMLElement;
  private currentLayer: LayerItem;
  private mainLayer: LayerItem;

  public constructor(baseLayers: Record<string, MapLayer>) {
    super({
      icon: "layers",
      title: "Layers",
    });
    this.layerList = [];
    DomUtil.create("h3", "title", this.container).innerText = "Maps";

    this.layerWrapper = DomUtil.create("ul", "layers-wrapper", this.container);
    this.layerContainer = DomUtil.create("ul", "layers", this.layerWrapper);

    for (const layer of Object.values(baseLayers)) {
      if (!layer.legacy) this.addBaseLayer(layer);
      else this.addLegacyLayer(layer);
    }

    this.legacyContainer = this.createLegacyDropdown();
    for (const layer of Object.values(baseLayers)) {
      if (layer.legacy) this.addLegacyLayer(layer);
    }

    const mainLayer = this.findLayer("in-game");
    if (mainLayer) this.currentLayer = mainLayer;
    else this.currentLayer = this.layerList[0];
    this.mainLayer = this.currentLayer;
    this.enableLayer(this.currentLayer);
  }

  private addBaseLayer(layer: MapLayer) {
    const li = this.createBaseLayerLi(layer);
    this.addLayer(li, layer);
  }

  private addLegacyLayer(layer: MapLayer) {
    const li = this.createLegacyLayerLi(layer);
    this.addLayer(li, layer);
  }

  private addLayer(li: HTMLElement, layer: MapLayer) {
    const layerItem = {
      name: layer.layerName,
      layer,
      li,
    };
    this.addClickHandler(layerItem);
    this.layerList.push(layerItem);
  }

  private createBaseLayerLi(layer: MapLayer): HTMLElement {
    const li = DomUtil.create("li", "layer selectable", this.layerContainer);

    const icon = DomUtil.create("img", "", li);
    icon.src = `tiles/${layer.tilePath}/icon.png`;
    const iconSize = 128;
    icon.style.width = iconSize + "px";
    icon.style.height = iconSize + "px";

    const div = DomUtil.create("div", "flex-ch", li);
    const p = DomUtil.create("p", "", div);
    p.innerText = layer.displayName;
    return li;
  }

  private createLegacyLayerLi(layer: MapLayer): HTMLElement {
    const li = DomUtil.create("li", "layer selectable", this.legacyContainer);
    const div = DomUtil.create("div", "flex-ch", li);
    const p = DomUtil.create("p", "", div);
    p.innerText = layer.displayName;
    return li;
  }

  private addClickHandler(layerItem: LayerItem) {
    const { li, name } = layerItem;
    DomEvent.addListener(li, "click", () => {
      window._paq.push(["trackEvent", "Control", "Layers", `show ${name}`]);
      if (!DomUtil.hasClass(li, "selected")) {
        this.enableLayer(layerItem);
      }
    });
  }

  private findLayer(name: string) {
    return this.layerList.find((layer) => layer.name === name);
  }

  public enableMapLayer(layerName: string) {
    for (const layerItem of Object.values(this.layerList)) {
      const { name } = layerItem;
      if (name === layerName) {
        this.enableLayer(layerItem);
        return;
      }
    }
  }

  private enableLayer(layerItem: LayerItem) {
    const { li, layer, name } = layerItem;
    DomUtil.addClass(li, "selected");
    if (name === this.currentLayer.name) return;

    this.disableLayer(this.currentLayer);
    this.currentLayer = layerItem;
    layer.show();
    URLResolver.updateMapLayerURL(name, this.mainLayer.name);
  }

  private disableLayer(layerItem: LayerItem) {
    const { li, layer } = layerItem;
    DomUtil.removeClass(li, "selected");
    layer.hide();
  }

  private createLegacyDropdown() {
    const groupDiv = DomUtil.create("div", "legacy-maps", this.layerWrapper);
    const groupHeader = DomUtil.create("div", "header", groupDiv);
    const groupHeaderDropdown = DomUtil.create("p", "dropdown", groupHeader);
    groupHeaderDropdown.innerText = " ▼";
    DomUtil.addClass(groupHeaderDropdown, "toggled-on");

    const groupHeaderTitle = DomUtil.create("p", "title", groupHeader);
    groupHeaderTitle.innerText = "Legacy Maps";
    groupHeaderTitle.style.textAlign = "center";
    groupHeaderTitle.style.fontWeight = "bold";

    const groupBody = DomUtil.create("ul", "group", groupDiv);
    DomUtil.addClass(groupBody, "visible");

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
    return groupBody;
  }
}
