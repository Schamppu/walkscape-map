import * as Schema from "../JSONSchema";
import { DomUtil } from "leaflet";
import { WSPopup, WSPopupOptions } from "./WSPopup";

export interface LocationPopupOptions extends WSPopupOptions {
  realm: string;
  wikiUrl: string;
  activities: Schema.Activity[];
  buildings: Schema.Building[];
  services: Schema.Service[];
}

export class LocationPopup extends WSPopup {
  private wikiUrl: string;
  private realm: string;
  private activities: Schema.Activity[];
  private buildings: Schema.Building[];
  private services: Schema.Service[];
  private skillIconPaths: { [key: string]: string };
  private pluralKeywords: string[];

  private constructor(options: LocationPopupOptions) {
    super(options);
    this.realm = options.realm;
    this.activities = options.activities;
    this.buildings = options.buildings;
    this.services = options.services;
    this.wikiUrl = options.wikiUrl;

    this.skillIconPaths = {
      agility: "icons/activities/activity_sprites/agility/dasboot3.png",
      carpentry: "icons/activities/activity_sprites/carpentry/full.png",
      cooking: "icons/activities/activity_sprites/cooking/full.png",
      crafting: "icons/activities/activity_sprites/crafting/full.png",
      fishing: "icons/activities/activity_sprites/fishing/full.png",
      foraging: "icons/activities/activity_sprites/foraging/full.png",
      mining: "icons/activities/activity_sprites/mining/pickaxe.png",
      smithing: "icons/activities/activity_sprites/smithing/full.png",
      woodcutting: "icons/activities/activity_sprites/woodcutting/axe.png",
    };
    this.pluralKeywords = ["skis"];

    this.container = DomUtil.create("div", "ws-location-popup");
    this.setContent(this.container);
  }

  public static override create(options: LocationPopupOptions) {
    return new LocationPopup({
      ...options,
      minWidth: undefined,
    });
  }

  protected createPopupContent() {
    this.createTitleContent();
    this.createBodyContent();
  }

  private createTitleContent() {
    const titleDiv = DomUtil.create("div", "title-wrapper", this.container);
    const icon = new Image(16, 16);
    icon.src = `icons/${this.icon.url}`;
    icon.className = "title-icon";
    titleDiv.appendChild(icon);

    if (this.wikiUrl.length) {
      const title = DomUtil.create("h2", "title", titleDiv);
      const titleLink = DomUtil.create("a", `color-${this.realm}`, title);
      titleLink.innerText = this.name;
      titleLink.href = this.wikiUrl;
      titleLink.target = "_blank";
    } else {
      const title = DomUtil.create("h2", `title color-${this.realm}`, titleDiv);
      title.innerText = this.name;
    }

    const divider = DomUtil.create(
      "div",
      `title-divider bg-${this.realm}`,
      this.container
    );
    DomUtil.create("span", "", divider);
    DomUtil.create("span", "", divider);
  }

  private createBodyContent() {
    const createSubDiv = (name: string, parent: HTMLElement) => {
      const subDiv = DomUtil.create("div", "subdiv", parent);
      const subHeader = DomUtil.create(
        "p",
        "subheader",
        subDiv
      );
      subHeader.innerText = name;
      const subContentDiv = DomUtil.create(
        "div",
        `subcontent ${name}`,
        subDiv
      );
      return [subDiv, subContentDiv];
    };

    const body = DomUtil.create("div", "", this.container);

    const subContentDivs = ["activities", "services", "buildings"].map((v) => {
      const [, subContentDiv] = createSubDiv(v, body);
      return subContentDiv;
    });

    const createActivityContent = (
      parent: HTMLElement,
      data: Schema.Activity[]
    ) => {
      const splitWords = (str: string) => {
        const result = str.replace(/([A-Z])/g, " $1");
        const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
        return finalResult.toLowerCase();
      };

      data.forEach((d) => {
        const dataDiv = DomUtil.create(
          "div",
          "subdiv-content",
          parent
        );
        const img = new Image(d.icon.width ?? 32, d.icon.height ?? 32);
        img.src = `icons/${d.icon.url}`;
        dataDiv.appendChild(img);

        const infoDiv = DomUtil.create(
          "div",
          "activity-info",
          dataDiv
        );
        const textsDiv = DomUtil.create(
          "div",
          "info-texts",
          infoDiv
        );
        const text = DomUtil.create("p", "", textsDiv);
        if (d.wikiUrl.length) {
          const link = DomUtil.create("a", "", text);
          link.innerText = d.name;
          link.href = d.wikiUrl;
          link.target = "_blank";
        } else {
          text.innerText = d.name;
        }

        const keywordRequirementsDiv = DomUtil.create(
          "div",
          "requirements-keywords",
          textsDiv
        );
        const skillRequirementDiv = DomUtil.create(
          "div",
          "requirements-skills",
          infoDiv
        );

        d.requiredKeywords.forEach((kw) => {
          const keyword = DomUtil.create("p", "", keywordRequirementsDiv);
          const kwText = this.pluralKeywords.includes(kw)
            ? `• requires ${splitWords(kw)}`
            : `• requires a ${splitWords(kw)}`;
          keyword.innerText = kwText;
        });

        for (const [skill, level] of Object.entries(d.levelRequirements)) {
          const skillDiv = DomUtil.create(
            "div",
            `skill-div border-${skill}`,
            skillRequirementDiv
          );
          const img = new Image(d.icon.width ?? 16, d.icon.height ?? 16);
          img.src = this.skillIconPaths[skill];
          skillDiv.appendChild(img);
          const levelText = DomUtil.create("p", "", skillDiv);
          levelText.innerText = `${level}`;
        }
      });
    };

    const createSubContent = (
      parent: HTMLElement,
      data: Schema.DataPoint[]
    ) => {
      data.forEach((d) => {
        const dataDiv = DomUtil.create(
          "div",
          "subdiv-content",
          parent
        );
        const img = new Image(d.icon.width ?? 32, d.icon.height ?? 32);
        img.src = `icons/${d.icon.url}`;
        dataDiv.appendChild(img);

        const text = DomUtil.create("p", "", dataDiv);
        if (d.wikiUrl.length) {
          const link = DomUtil.create("a", "", text);
          link.innerText = d.name;
          link.href = d.wikiUrl;
          link.target = "_blank";
        } else {
          text.innerText = d.name;
        }
      });
    };

    createActivityContent(subContentDivs[0], this.activities);
    createSubContent(subContentDivs[1], this.services);
    createSubContent(subContentDivs[2], this.buildings);
  }
}
