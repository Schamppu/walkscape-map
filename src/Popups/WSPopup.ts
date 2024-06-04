import { Popup, PopupOptions, DomUtil } from "leaflet";

export interface WSPopupOptions extends PopupOptions {
  id: string;
  name: string;
  icon: {
    url: string;
    width?: number | undefined;
    height?: number | undefined;
  };
}

export abstract class WSPopup extends Popup {
  protected container: HTMLElement;
  protected name: string;
  protected icon: {
    url: string;
    width?: number | undefined;
    height?: number | undefined;
  };

  protected constructor(options: WSPopupOptions) {
    super(options);

    this.name = options.name;
    this.icon = options.icon;
    this.container = DomUtil.create("div", "ws-popup");
    this.setContent(this.container);
  }

  public static create(options: WSPopupOptions): any {
    if (options || !options)
      throw new Error('Method not implemented! Use derived class');
  }
  
  protected abstract createPopupContent(): void
  
  public getPopupContent() {
    if (!this.container.hasChildNodes()) {
      this.createPopupContent()
    }
    return this.container;
  }
}
