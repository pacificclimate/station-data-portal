import { describe, it, expect } from "vitest";
import map from "lodash/fp/map";
import escapeRegExp from "lodash/fp/escapeRegExp";

import {
  date2pdpFormat,
  networkUris2pdpFormat,
  variable2PdpVariableIdentifier,
  variableIds2pdpFormats,
  frequencies2pdpFormat,
  dataDownloadTarget,
  stationDataDownloadRequest,
} from "./pdp-data-service";

describe("date2pdpFormat", () => {
  it("works for null date", () => {
    expect(date2pdpFormat(null)).toBe("");
  });

  it.each([
    [2000, 1, 1, "2000/01/01"],
    [2000, 10, 1, "2000/10/01"],
    [2000, 10, 10, "2000/10/10"],
  ])("works for %i/%i/%i", (year, month, day, expected) => {
    expect(date2pdpFormat(new Date(year, month - 1, day))).toBe(expected);
  });
});

const mockNetworkObject = ([name, id]) => ({ name, uri: `/networks/${id}` });

describe("networkUris2pdpFormat", () => {
  const allNetworks = map(mockNetworkObject)([
    ["alpha", 14],
    ["beta", 11],
    ["gamma", 12],
  ]);

  it.each`
    uris                                                | expected
    ${[]}                                               | ${""}
    ${["/networks/14"]}                                 | ${"alpha"}
    ${["/networks/14", "/networks/11"]}                 | ${"alpha,beta"}
    ${["/networks/14", "/networks/11", "/networks/12"]} | ${""}
  `("works for $uris", ({ uris, expected }) => {
    expect(networkUris2pdpFormat(allNetworks)(uris)).toBe(expected);
  });
});

describe("variable2PdpVariableIdentifier", () => {
  it.each`
    standard_name      | cell_method                  | expected
    ${"standard_name"} | ${null}                      | ${"standard_name"}
    ${"standard_name"} | ${""}                        | ${"standard_name"}
    ${"standard_name"} | ${"cell_method"}             | ${"standard_namecell_method"}
    ${"standard_name"} | ${"time: gronk"}             | ${"standard_name_gronk"}
    ${"standard_name"} | ${"time: gronk time: argle"} | ${"standard_name_gronk _argle"}
  `("works for %j", ({ standard_name, cell_method, expected }) => {
    expect(variable2PdpVariableIdentifier({ standard_name, cell_method })).toBe(
      expected,
    );
  });
});

const mockVariable = ([id, name]) => ({
  id,
  standard_name: `${name}_sn`,
  cell_method: `${name}_cm`,
});

describe("variableIds2pdpFormats", () => {
  const allVariables = map(mockVariable)([
    [1, "alpha"],
    [2, "beta"],
    [3, "gamma"],
    [4, "delta"],
  ]);

  it.each`
    description      | variableIds     | expected
    ${"empty array"} | ${[]}           | ${""}
    ${"1 id"}        | ${[1]}          | ${"alpha_snalpha_cm"}
    ${"2 ids"}       | ${[1, 2]}       | ${"alpha_snalpha_cm,beta_snbeta_cm"}
    ${"3 ids "}      | ${[1, 2, 3]}    | ${"alpha_snalpha_cm,beta_snbeta_cm,gamma_sngamma_cm"}
    ${"3 ids (off)"} | ${[1, 2, 4]}    | ${"alpha_snalpha_cm,beta_snbeta_cm,delta_sndelta_cm"}
    ${"4 ids (all)"} | ${[1, 2, 3, 4]} | ${""}
    ${"repeats"}     | ${[1, 2, 2]}    | ${"alpha_snalpha_cm,beta_snbeta_cm"}
  `("works for $description", ({ description, variableIds, expected }) => {
    const result = variableIds2pdpFormats(allVariables)(variableIds);
    expect(result).toBe(expected);
  });
});

const frequencyOption = (value) => ({ value });

describe("frequencyOptions2pdpFormat", () => {
  const allFrequencies = ["alpha", "beta", "gamma"];

  it.each`
    description      | values                        | expected
    ${"empty array"} | ${[]}                         | ${""}
    ${"1 value"}     | ${["alpha"]}                  | ${"alpha"}
    ${"2 values"}    | ${["alpha", "beta"]}          | ${"alpha,beta"}
    ${"3 values"}    | ${["alpha", "gamma", "beta"]} | ${""}
  `("works for $description", ({ values, expected }) => {
    expect(frequencies2pdpFormat(allFrequencies)(values)).toBe(expected);
  });
});

const dataFormatOption = (value) => ({ value });

describe("dataDownloadTarget", () => {
  const config = { pdpDataUrl: "PDP_DATA_URL" };

  const regex = (s) => new RegExp(escapeRegExp(s));

  const geoJSONNullPolygon = {
    type: "Polygon",
    coordinates: [],
  };

  it("works for clipToDate and onlyWithClimatology true", () => {
    const allNetworks = map(mockNetworkObject)([
      ["nw1", 1],
      ["nw2", 2],
      ["nw3", 3],
    ]);
    const allVariables = map(mockVariable)([
      [1, "var1"],
      [2, "var2"],
      [3, "var3"],
    ]);
    const allFrequencies = ["freq1", "freq2", "freq3"];

    const target = dataDownloadTarget({
      config,
      startDate: new Date(2000, 0, 1),
      endDate: new Date(2010, 11, 31),
      selectedNetworksUris: ["/networks/1", "/networks/2"],
      selectedVariablesIds: [1, 2],
      selectedFrequencies: ["freq1", "freq2"],
      polygon: geoJSONNullPolygon,
      clipToDate: true,
      onlyWithClimatology: true,
      dataCategory: "category",
      dataFormat: dataFormatOption("format"),
      allNetworks,
      allVariables,
      allFrequencies,
    });
    expect(target).toMatch(regex(`PDP_DATA_URL/agg?`));
    expect(target).toMatch(regex("from-date=2000%2F01%2F01"));
    expect(target).toMatch(regex("to-date=2010%2F12%2F31"));
    expect(target).toMatch(regex("network-name=nw1%2Cnw2"));
    expect(target).toMatch(regex("input-vars=var1_snvar1_cm%2Cvar2_snvar2_cm"));
    expect(target).toMatch(regex("input-freq=freq1%2Cfreq2"));
    expect(target).toMatch(regex("input-polygon=POLYGON"));
    expect(target).toMatch(regex("cliptodate=cliptodate"));
    expect(target).toMatch(
      regex("only-with-climatology=only-with-climatology"),
    );
    expect(target).toMatch(regex("download-category=Category"));
    expect(target).toMatch(regex("data-format=format"));
  });

  it("works for clipToDate and onlyWithClimatology false", () => {
    const allNetworks = map(mockNetworkObject)([
      ["nw1", 1],
      ["nw2", 2],
      ["nw3", 3],
    ]);
    const allVariables = map(mockVariable)([
      [1, "var1"],
      [2, "var2"],
      [3, "var3"],
    ]);
    const allFrequencies = ["freq1", "freq2", "freq3"];

    const target = dataDownloadTarget({
      config,
      startDate: new Date(2000, 0, 1),
      endDate: new Date(2010, 11, 31),
      selectedNetworksUris: ["/networks/1", "/networks/2"],
      selectedVariablesIds: [1, 2],
      selectedFrequencies: ["freq1", "freq2"],
      polygon: geoJSONNullPolygon,
      clipToDate: false,
      onlyWithClimatology: false,
      dataCategory: "category",
      dataFormat: dataFormatOption("format"),
      allNetworks,
      allVariables,
      allFrequencies,
    });
    expect(target).toMatch(regex(`PDP_DATA_URL/agg?`));
    expect(target).toMatch(regex("from-date=2000%2F01%2F01"));
    expect(target).toMatch(regex("to-date=2010%2F12%2F31"));
    expect(target).toMatch(regex("network-name=nw1%2Cnw2"));
    expect(target).toMatch(regex("input-vars=var1_snvar1_cm%2Cvar2_snvar2_cm"));
    expect(target).toMatch(regex("input-freq=freq1%2Cfreq2"));
    expect(target).toMatch(regex("input-polygon=POLYGON"));
    expect(target).not.toMatch(regex("cliptodate"));
    expect(target).toMatch(regex("only-with-climatology="));
    expect(target).toMatch(regex("download-category=Category"));
    expect(target).toMatch(regex("data-format=format"));
  });
});

describe("stationDataDownloadRequest", () => {
  const options = {
    config: { pdpDataUrl: "https://example.invalid/data/", maxUrlLength: 10 },
    stationIds: [42, 37, 42],
    dataFormat: { value: "csv" },
    dataCategory: "timeseries",
    startDate: new Date(2000, 0, 1),
    endDate: new Date(2010, 11, 31),
  };
  it.each(["nc", "csv", "xlsx"])(
    "requests exact IDs as a server ZIP in %s",
    (value) => {
      expect(
        stationDataDownloadRequest({ ...options, dataFormat: { value } }),
      ).toEqual({
        action: "https://example.invalid/data/agg",
        fields: {
          "station-ids": "37,42",
          format: value,
          climatology: "false",
          clip_dates: "false",
          "network-name": "",
          "input-vars": "",
          "input-freq": "",
          "input-polygon": "",
          only_with_climatology: "false",
          from_date: "2000-01-01",
          to_date: "2010-12-31",
        },
      });
    },
  );
  it("sends the same IDs for climatologies", () => {
    expect(
      stationDataDownloadRequest({ ...options, dataCategory: "climatology" })
        .fields,
    ).toEqual({
      "station-ids": "37,42",
      format: "csv",
      climatology: "true",
      clip_dates: "false",
      "network-name": "",
      "input-vars": "",
      "input-freq": "",
      "input-polygon": "",
      only_with_climatology: "false",
      from_date: "2000-01-01",
      to_date: "2010-12-31",
    });
  });
  it("keeps date coverage filters separate from observation clipping", () => {
    expect(
      stationDataDownloadRequest({ ...options, clipToDate: true }).fields,
    ).toMatchObject({
      clip_dates: "true",
      from_date: "2000-01-01",
      to_date: "2010-12-31",
    });
    expect(
      stationDataDownloadRequest({
        ...options,
        clipToDate: true,
        startDate: null,
      }).fields,
    ).not.toHaveProperty("from_date");
    expect(
      stationDataDownloadRequest({
        ...options,
        clipToDate: true,
        endDate: null,
      }).fields,
    ).not.toHaveProperty("to_date");
  });
  it("intersects IDs with every active aggregate selection criterion", () => {
    const request = stationDataDownloadRequest({
      ...options,
      selectedNetworksUris: ["/networks/1"],
      allNetworks: [{ uri: "/networks/1", name: "EC" }],
      selectedVariablesIds: [1],
      allVariables: [
        {
          id: 1,
          standard_name: "precipitation_amount",
          cell_method: "time: sum",
        },
        { id: 2, standard_name: "air_temperature" },
      ],
      selectedFrequencies: ["daily"],
      allFrequencies: ["daily", "1-hourly"],
      onlyWithClimatology: true,
      polygon: {
        type: "Polygon",
        coordinates: [
          [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 0],
          ],
        ],
      },
    });
    expect(request.fields).toEqual({
      "station-ids": "37,42",
      format: "csv",
      climatology: "false",
      clip_dates: "false",
      "network-name": "EC",
      "input-vars": "precipitation_amount_sum",
      "input-freq": "daily",
      "input-polygon": "POLYGON ((0 0, 1 0, 1 1, 0 0))",
      only_with_climatology: "true",
      from_date: "2000-01-01",
      to_date: "2010-12-31",
    });
  });
  it("keeps large selections out of the URL", () => {
    const ids = Array.from({ length: 10000 }, (_, index) => index + 1);
    const request = stationDataDownloadRequest({ ...options, stationIds: ids });
    expect(request.action).toBe("https://example.invalid/data/agg");
    expect(request.fields["station-ids"].split(",")).toHaveLength(10000);
  });
  it.each([[], [0], [-1], [true], [1.5], ["37"], [NaN], [null], undefined])(
    "rejects empty or invalid station IDs (%j) rather than requesting every station",
    (stationIds) => {
      expect(() =>
        stationDataDownloadRequest({ ...options, stationIds }),
      ).toThrow(/valid database ID/);
    },
  );
});
