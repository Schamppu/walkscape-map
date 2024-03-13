import { CRS, Transformation, Util } from "leaflet";

export function create(mapSize: number, tileSize: number): L.CRS {
  const scale = (4 * tileSize) / mapSize;

  // used map is wider than official for bigger tilesize
  const widthOffest = 136;
  const wscrs = Util.extend({}, CRS.Simple, {
    transformation: new Transformation(scale, widthOffest, scale, 0),
  });

  return wscrs;
}
