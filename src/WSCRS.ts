import { CRS, Transformation, Util } from "leaflet";

export function create(mapSize: number, tileSize: number): L.CRS {
  const scale = (2 * tileSize) / mapSize;

  // used map is wider than official for bigger tilesize
  const baseWidthOffest = 1440;
  const baseHeightOffest = 1488;
  const wscrs = Util.extend({}, CRS.Simple, {
    transformation: new Transformation(
      scale,
      baseWidthOffest / 8,
      scale,
      baseHeightOffest / 8
    ),
  });

  return wscrs;
}
