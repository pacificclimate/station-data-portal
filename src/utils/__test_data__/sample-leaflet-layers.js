// contains objects standing in for Leaflet layers.
// only the toGeoJSON() function is available.

export const polygon1 = [
  [
    [-122.047786, 71.365177],
    [-119.877348, 70.43932],
    [-115.428989, 69.973676],
    [-112.210557, 71.225339],
    [-119.665702, 72.198183],
    [-122.047786, 71.365177],
  ],
];

export const polygon2 = [
  [
    [-127.819692, 67.709523],
    [-126.720749, 66.35929],
    [-123.509963, 66.216038],
    [-119.828347, 67.061979],
    [-120.280087, 68.558384],
    [-125.128156, 68.667255],
    [-127.819692, 67.709523],
  ],
];

class fakeLeafletLayerWithGeoJSON {
  constructor(polygon) {
    this.geoJSON = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: polygon,
      },
    };
  }

  toGeoJSON() {
    return this.geoJSON;
  }
}

export const fakeLeafletLayer1 = new fakeLeafletLayerWithGeoJSON(polygon1);
export const fakeLeafletLayer2 = new fakeLeafletLayerWithGeoJSON(polygon2);
