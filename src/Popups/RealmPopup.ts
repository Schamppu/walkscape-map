import { DomUtil } from "leaflet";
import { WSPopup, WSPopupOptions } from "./WSPopup";

export interface RealmPopupOptions extends WSPopupOptions {
  motto: string;
  lore: string;
  info: string[];
}

export class RealmPopup extends WSPopup {
  private constructor(options: RealmPopupOptions) {
    super(options);
    
    this.container = DomUtil.create("div", "ws-realm-popup");
    this.setContent(this.container);
  }

  public static override create(options: RealmPopupOptions) {
    return new RealmPopup({
      ...options,
      minWidth: undefined,
    });
  }

  protected createPopupContent() {
    this.createTitleContent();
  }

  private createTitleContent() {
    const titleDiv = DomUtil.create(
      "div",
      "ws-realm-popup__title-wrapper",
      this.container
    );
    titleDiv.innerText = this.name
  }
}
