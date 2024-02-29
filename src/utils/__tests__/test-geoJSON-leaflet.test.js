import {
  geoJSONToLeafletLayers,
  layersToGeoJSON,
  layersToGeoJSONMultipolygon,
} from "../geoJSON-leaflet.js";
import {
  fakeLeafletLayer1,
  fakeLeafletLayer2,
  polygon1,
  polygon2,
} from "../__test_data__/sample-leaflet-layers.js";

describe("geoJSONToLeafletLayers", function () {});

describe("layersToGeoJSON", function () {
  const expectedSingle = {
    geometry: {
      coordinates: polygon1,
      type: "Polygon",
    },
    properties: {
      source: "PCIC Climate Explorer",
    },
    type: "Feature",
  };
  const expectedGeometry = {
    geometry: {
      geometries: [
        {
          coordinates: polygon1,
          type: "Polygon",
        },
        {
          coordinates: polygon2,
          type: "Polygon",
        },
      ],
      type: "GeometryCollection",
    },
    properties: { source: "PCIC Climate Explorer" },
    type: "Feature",
  };

  const expectedFeature = {
    features: [
      {
        geometry: {
          coordinates: polygon1,
          type: "Polygon",
        },
        properties: { source: "PCIC Climate Explorer" },
        type: "Feature",
      },
      {
        geometry: {
          coordinates: polygon2,
          type: "Polygon",
        },
        properties: {},
        type: "Feature",
      },
    ],
    properties: {
      source: "PCIC Climate Explorer",
    },
    type: "FeatureCollection",
  };

  it("generates an empty collection from  0 layers", function () {
    expect(layersToGeoJSON("FeatureCollection", [])).toEqual({});
    expect(layersToGeoJSON("GeometryCollection", [])).toEqual({});
  });
  it("translates a single layer into a Feature", function () {
    expect(layersToGeoJSON("FeatureCollection", [fakeLeafletLayer1])).toEqual(
      expectedSingle,
    );
    expect(layersToGeoJSON("GeometryCollection", [fakeLeafletLayer1])).toEqual(
      expectedSingle,
    );
  });
  it("translates multiple layers into a GeometryCollection", function () {
    expect(
      layersToGeoJSON("GeometryCollection", [
        fakeLeafletLayer1,
        fakeLeafletLayer2,
      ]),
    ).toEqual(expectedGeometry);
  });
  it("translates multiple layers into a FeatureCollection", function () {
    expect(
      layersToGeoJSON("FeatureCollection", [
        fakeLeafletLayer1,
        fakeLeafletLayer2,
      ]),
    ).toEqual(expectedFeature);
  });
});

describe("layersToGeoJSONMultipolygon", function () {
  it("translates no layers", function () {
    expect(layersToGeoJSONMultipolygon([])).toBeUndefined();
  });
  it("translates a single layer", function () {
    const expected1 = {
      coordinates: [polygon1],
      type: "MultiPolygon",
      properties: { source: "PCIC Climate Explorer" },
    };
    expect(layersToGeoJSONMultipolygon([fakeLeafletLayer1])).toEqual(expected1);
  });
  it("translates multiple layers", function () {
    const expected2 = {
      coordinates: [polygon1, polygon2],
      type: "MultiPolygon",
      properties: { source: "PCIC Climate Explorer" },
    };

    expect(
      layersToGeoJSONMultipolygon([fakeLeafletLayer1, fakeLeafletLayer2]),
    ).toEqual(expected2);
  });
});
