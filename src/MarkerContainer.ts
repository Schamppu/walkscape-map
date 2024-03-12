import { WSMarker } from "./WSMarker";

export class MarkerContainer {
  private markers = <{ [key: string]: WSMarker }>{};
  private visible = false;

  public addMarker(marker: WSMarker): void {
    this.markers[marker.id] = marker;
  }

  public removeMarker(marker: WSMarker): void {
    delete this.markers[marker.id];
  }

  public show(): void {
    this.visible = true;
  }

  public hide(): void {
    this.visible = false;
  }

  public isVisible(): boolean {
    return this.visible;
  }

  public getMarker(id: string): WSMarker {
    return this.markers[id];
  }

  public getMarkers(): WSMarker[] {
    return Object.values(this.markers);
  }
}
