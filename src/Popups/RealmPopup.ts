import { DomUtil, Point } from "leaflet";
import { WSPopup, WSPopupOptions } from "./WSPopup";

export interface RealmPopupOptions extends WSPopupOptions {
  id: string;
  icon: { url: string; width?: number; height?: number };
  motto: string;
  lore: string;
  info: string[];
  hiddenText: string;
  wordsToHighlight: string[];
}

export class RealmPopup extends WSPopup {
  private realmOptions: RealmPopupOptions;
  private constructor(options: RealmPopupOptions) {
    super(options);
    this.realmOptions = options;

    this.container = DomUtil.create("div", "realm-popup");
    this.setContent(this.container);
  }

  public static override create(options: RealmPopupOptions) {
    return new RealmPopup({
      ...options,
      minWidth: undefined,
      offset: new Point(200, options.hiddenText ? 75 : 200),
    });
  }

  private highlightText(text: string) {
    const seenWords = new Set();

    this.realmOptions.wordsToHighlight.forEach((word) => {
      const regex = new RegExp(`\\b(${word})\\b`, "i");
      text = text.replace(regex, (match) => {
        if (!seenWords.has(match.toLowerCase())) {
          seenWords.add(match.toLowerCase());
          return `<span class="highlight">${match}</span>`;
        }
        return match;
      });
    });
    return text;
  }

  protected createPopupContent() {
    this.createTitleContent();
    if (this.realmOptions.hiddenText.length) {
      this.createHiddenTextContent();
    } else {
      this.createMottoContent();
      this.createLoreContent();
      this.createInfoContent();
    }
  }

  private createTitleContent() {
    const titleDiv = DomUtil.create(
      "div",
      `title color-${this.realmOptions.id}`,
      this.container
    );
    titleDiv.innerText = this.name;
  }

  private createMottoContent() {
    const mottoDiv = DomUtil.create("div", "motto", this.container);

    const img = new Image(64, 64);
    img.src = `icons/${this.icon.url}`;
    mottoDiv.appendChild(img);

    const mottoText = DomUtil.create(
      "p",
      `text color-${this.realmOptions.id}`,
      mottoDiv
    );
    const mottoSpan = DomUtil.create("span", "highlight", mottoText);
    mottoSpan.innerText = this.realmOptions.motto;
  }

  private createLoreContent() {
    const loreDiv = DomUtil.create(
      "p",
      `lore color-${this.realmOptions.id}`,
      this.container
    );
    loreDiv.innerHTML = this.highlightText(this.realmOptions.lore);
  }

  private createInfoContent() {
    const infoDiv = DomUtil.create("div", "info-wrapper", this.container);

    for (const info of this.realmOptions.info) {
      DomUtil.create(
        "p",
        `info color-${this.realmOptions.id}`,
        infoDiv
      ).innerHTML = "> " + this.highlightText(info);
    }
  }

  private createHiddenTextContent() {
    const wrapper = DomUtil.create("div", "hidden-wrapper", this.container);
    DomUtil.create(
      "p",
      `hidden-text color-${this.realmOptions.id}`,
      wrapper
    ).innerText = this.realmOptions.hiddenText;
  }
}
