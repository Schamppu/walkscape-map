import * as Schema from "../JSONSchema";
import { WSMarker } from "./WSMarker";
import { Layer } from "../Layer";
import { LatLngExpression } from "leaflet";
import { RealmPopup } from "../Popups/RealmPopup";

export class WSRealmMarker extends WSMarker {
  declare popup: RealmPopup;
  protected constructor(
    json: Schema.Realm,
    coords: LatLngExpression,
    layer: Layer
  ) {
    super(json, coords, layer);
    this.popup = RealmPopup.create({
      id: this.id,
      name: json.fullName ? json.fullName : this.name,
      icon: json.icon,
      motto: json.motto,
      lore: json.lore,
      info: json.info,
      hiddenText: json.hiddenText ? json.hiddenText : "",
      wordsToHighlight: json.wordsToHighLight,
    });
    this.bindPopup(this.popup);
  }

  public static fromJson(json: Schema.Realm, layer: Layer): WSRealmMarker {
    const marker = new WSRealmMarker(json, json.coords, layer);
    return marker;
  }
}
