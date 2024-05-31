import { DomUtil, DomEvent } from "leaflet";
import { ControlPane } from "./ControlPane";
import { MapLayer } from "../MapLayer";

interface LayerItem {
  name: string;
  layer: MapLayer;
  li: HTMLElement;
}

export class LayersControl extends ControlPane {
  private layerList: LayerItem[];
  private layerContainer: HTMLElement;
  private currentLayer: LayerItem;

  public constructor(baseLayers: Record<string, MapLayer>) {
    super({
      icon: "layers",
      title: "Layers",
    });
    this.layerList = [];
    DomUtil.create("h3", "ws-control__title", this.container).innerText =
      "Maps";

    this.layerContainer = DomUtil.create(
      "ul",
      "ws-legend__categories",
      this.container
    );

    for (const [name, layer] of Object.entries(baseLayers)) {
      this.addBaseLayer(name, layer);
    }

    const mainLayer = this.findLayer("in-game");
    if (mainLayer) this.currentLayer = mainLayer;
    else this.currentLayer = this.layerList[0];
    this.enableLayer(this.currentLayer);
  }

  private addBaseLayer(name: string, layer: MapLayer) {
    const li = this.createBaseLayerLi(name);
    const layerItem = {
      name,
      layer,
      li,
    };
    this.addClickHandler(layerItem);
    this.layerList.push(layerItem);
  }

  private createBaseLayerLi(name: string): HTMLElement {
    const li = DomUtil.create(
      "li",
      "ws-legend__category-div selectable",
      this.layerContainer
    );

    const icon = DomUtil.create("img", "", li);
    icon.src = `tiles/${name}/icon.png`;
    const iconSize = 128;
    icon.style.width = iconSize + "px";
    icon.style.height = iconSize + "px";

    const div = DomUtil.create("div", "flex-center", li)
    const p = DomUtil.create("p", "layer__title", div);
    p.innerText = this.capitalize(name);
    return li;
  }

  private addClickHandler(layerItem: LayerItem) {
    const { li } = layerItem;
    DomEvent.addListener(li, "click", () => {
      if (!DomUtil.hasClass(li, "selected")) {
        this.enableLayer(layerItem);
      }
    });
  }

  private findLayer(name: string) {
    return this.layerList.find((layer) => layer.name === name);
  }

  private enableLayer(layerItem: LayerItem) {
    const { li, layer, name } = layerItem;
    DomUtil.addClass(li, "selected");
    if (name === this.currentLayer.name) return;

    this.disableLayer(this.currentLayer);
    this.currentLayer = layerItem;
    layer.show();
  }

  private disableLayer(layerItem: LayerItem) {
    const { li, layer } = layerItem;
    DomUtil.removeClass(li, "selected");
    layer.hide();
  }

  private capitalize(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}
