import * as Schema from "./JSONSchema";

export class DataPoint implements Schema.DataPoint {
  public constructor(
    public id: string,
    public name: string,
    public icon: { url: string; width?: number; height?: number }
  ) {
    this.id = id;
    this.name = name;
    this.icon = icon;
  }

  public static isActivity(data: Schema.DataPoint): data is Schema.Activity {
    const keys = Object.keys(data);
    return keys.includes("skills") && keys.includes("levelRequirements");
  }

  public static isActivities(
    data: Schema.DataPoint[]
  ): data is Schema.Activity[] {
    return this.isActivity(data[0]);
  }

  public static isBuilding(data: Schema.DataPoint): data is Schema.Building {
    const keys = Object.keys(data);
    return keys.includes("type") && keys.includes("shop");
  }

  public static isBuildings(
    data: Schema.DataPoint[]
  ): data is Schema.Building[] {
    return this.isBuilding(data[0]);
  }

  public static isService(data: Schema.DataPoint): data is Schema.Service {
    const keys = Object.keys(data);
    return keys.includes("skills") && !keys.includes("levelRequirements");
  }

  public static isServices(data: Schema.DataPoint[]): data is Schema.Service[] {
    return this.isService(data[0]);
  }
}
