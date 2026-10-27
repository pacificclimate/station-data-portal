import React from "react";
import { beforeEach, expect, it } from "vitest";
import { act, fireEvent, screen } from "@testing-library/react";
import { renderWithProviders as renderBase, testConfig } from "@/test-utils";
import { useStationsStore } from "@/state/client/stations-store";
import DownloadStationData from "./DownloadStationData";

const station = (id, overrides = {}) => ({
  id,
  native_id: `N${id}`,
  network_uri: "/networks/1",
  histories: [
    {
      station_name: `Weather station ${id}`,
      lat: 0.25,
      lon: 0.75,
      variable_ids: [],
      freq: "daily",
    },
  ],
  ...overrides,
});

beforeEach(() =>
  useStationsStore.setState({
    startDate: null,
    endDate: null,
    selectedNetworks: ["/networks/1"],
    selectedVariables: [],
    selectedFrequencies: ["daily"],
    includeStationsWithNoObs: true,
    onlyWithClimatology: false,
    area: null,
  }),
);
const renderWithProviders = (ui, options = {}) =>
  renderBase(ui, {
    ...options,
    seedQueries: [
      [
        [NETWORKS_QUERY_KEY],
        [
          { uri: "/networks/1", name: "EC" },
          { uri: "/networks/99", name: "OTHER" },
        ],
      ],
      [
        VARIABLES_QUERY_KEY,
        [
          { id: 1, standard_name: "air_temperature" },
          {
            id: 999,
            standard_name: "precipitation_amount",
            cell_method: "time: sum",
            tags: ["climatology"],
          },
        ],
      ],
      [FREQUENCIES_QUERY_KEY, ["daily", "1-hourly"]],
      ...(options.seedQueries ?? []),
    ],
  });
const defaultFilterFields = {
  "network-name": "EC",
  "input-vars": "",
  "input-freq": "daily",
  "input-polygon": "",
  only_with_climatology: "false",
};

const fields = (button) => Object.fromEntries(new FormData(button.form));

it("posts one station to the aggregate route for both ZIP categories", () => {
  renderWithProviders(<DownloadStationData stations={[station(37)]} />);
  fireEvent.click(
    screen.getByRole("button", { name: "Download station data" }),
  );
  for (const category of ["Timeseries", "Climatology"]) {
    const button = screen.getByRole("button", {
      name: `Download ${category} ZIP`,
    });
    expect(button.form).toHaveAttribute(
      "action",
      "https://example.invalid/data/agg",
    );
    expect(button.form).toHaveAttribute("method", "post");
    expect(button.form).toHaveAttribute("target", "_blank");
    expect(button.form).toHaveAttribute("rel", "noopener");
    expect(fields(button)).toEqual({
      ...defaultFilterFields,
      "station-ids": "37",
      format: "nc",
      climatology: String(category === "Climatology"),
      clip_dates: "false",
    });
  }
});

it("offers a single ZIP per category for multiple selected stations and shows station names", () => {
  renderWithProviders(
    <DownloadStationData stations={[station(37), station(42), station(37)]} />,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Download station data" }),
  );
  expect(screen.getByText("Weather station 37 (N37)")).toBeInTheDocument();
  expect(screen.getByText("Weather station 42 (N42)")).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Download Timeseries ZIP" }),
  ).toBeEnabled();
  expect(
    screen.getByRole("button", { name: "Download Climatology ZIP" }),
  ).toBeEnabled();
  expect(screen.queryByText("Station 37")).not.toBeInTheDocument();
});

it("applies date clipping only when requested", () => {
  useStationsStore.setState({
    startDate: new Date(2020, 0, 1),
    endDate: new Date(2020, 11, 31),
  });
  renderWithProviders(<DownloadStationData stations={[station(37)]} />);
  fireEvent.click(
    screen.getByRole("button", { name: "Download station data" }),
  );
  const button = screen.getByRole("button", {
    name: "Download Timeseries ZIP",
  });
  expect(fields(button)).toMatchObject({
    from_date: "2020-01-01",
    to_date: "2020-12-31",
    clip_dates: "false",
  });
  fireEvent.click(
    screen.getByRole("checkbox", {
      name: "Clip time series to filter date range",
    }),
  );
  expect(fields(button)).toMatchObject({
    clip_dates: "true",
    from_date: "2020-01-01",
    to_date: "2020-12-31",
  });
});

it("does not open a download dialog for an empty station selection", () => {
  renderWithProviders(<DownloadStationData stations={[]} />);
  expect(
    screen.getByRole("button", { name: "Download station data" }),
  ).toBeDisabled();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

import { NETWORKS_QUERY_KEY } from "@/state/query-hooks/use-networks";
import { VARIABLES_QUERY_KEY } from "@/state/query-hooks/use-variables";
import { FREQUENCIES_QUERY_KEY } from "@/state/query-hooks/use-frequencies";
import { OBSERVATION_COUNTS_QUERY_KEY } from "@/state/query-hooks/use-observation-counts";
import { within } from "@testing-library/react";

it("summarises only the modal's stations and updates observations when clipping", () => {
  useStationsStore.setState({
    startDate: new Date(2020, 0, 1),
    endDate: new Date(2020, 11, 31),
  });
  renderWithProviders(
    <DownloadStationData stations={[station(37), station(42), station(37)]} />,
    {
      stationFiltering: { selectedStations: [station(99)] },
      seedQueries: [
        [
          [OBSERVATION_COUNTS_QUERY_KEY, null, null],
          {
            observationCounts: { 37: 100, 42: 200, 99: 999 },
            climatologyCounts: { 37: 10, 42: 20, 99: 999 },
          },
        ],
        [
          [OBSERVATION_COUNTS_QUERY_KEY, "2020-01-01", "2020-12-31"],
          {
            observationCounts: { 37: 5, 42: 15, 99: 999 },
            climatologyCounts: { 37: 10, 42: 20, 99: 999 },
          },
        ],
      ],
    },
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Download station data" }),
  );
  expect(
    within(screen.getByRole("row", { name: "Number of stations 2" })).getByRole(
      "cell",
    ),
  ).toHaveTextContent("2");
  expect(
    screen.getByRole("row", { name: /Total observations/ }),
  ).toHaveTextContent("300");
  expect(
    screen.getByRole("row", { name: /Total climatologies/ }),
  ).toHaveTextContent("30");
  fireEvent.click(
    screen.getByRole("checkbox", {
      name: "Clip time series to filter date range",
    }),
  );
  expect(
    screen.getByRole("row", { name: /Total observations/ }),
  ).toHaveTextContent("2020-01-01 to 2020-12-31");
  expect(
    within(screen.getByRole("row", { name: /Total observations/ })).getByRole(
      "cell",
    ),
  ).toHaveTextContent("20");
  expect(
    within(screen.getByRole("row", { name: /Total climatologies/ })).getByRole(
      "cell",
    ),
  ).toHaveTextContent("30");
});

it("submits IDs together with network, spatial, variable and frequency filters", () => {
  useStationsStore.setState({
    selectedNetworks: ["/networks/99"],
    selectedVariables: [999],
    selectedFrequencies: ["daily"],
    onlyWithClimatology: true,
    area: {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 0],
          ],
        ],
      ],
    },
  });
  const matchingStation = (id) =>
    station(id, {
      network_uri: "/networks/99",
      histories: [
        {
          station_name: `Weather station ${id}`,
          lat: 0.25,
          lon: 0.75,
          variable_ids: [999],
          freq: "daily",
        },
      ],
    });
  renderWithProviders(
    <DownloadStationData
      stations={[matchingStation(37), matchingStation(42), matchingStation(37)]}
    />,
    {
      stationFiltering: { selectedStations: [station(99)] },
    },
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Download station data" }),
  );
  expect(
    fields(screen.getByRole("button", { name: "Download Timeseries ZIP" })),
  ).toEqual({
    "station-ids": "37,42",
    "network-name": "OTHER",
    "input-vars": "precipitation_amount_sum",
    "input-freq": "daily",
    "input-polygon": "MULTIPOLYGON (((0 0, 1 0, 1 1, 0 0)))",
    only_with_climatology: "true",
    format: "nc",
    climatology: "false",
    clip_dates: "false",
  });
});

it("keeps a large selection enabled regardless of URL length limits", () => {
  renderWithProviders(
    <DownloadStationData
      stations={Array.from({ length: 1000 }, (_, i) => station(i + 1))}
    />,
    { config: { ...testConfig, maxUrlLength: 10 } },
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Download station data" }),
  );
  const button = screen.getByRole("button", {
    name: "Download Timeseries ZIP",
  });
  expect(button).toBeEnabled();
  expect(button.form.action).toBe("https://example.invalid/data/agg");
  expect(fields(button)["station-ids"].split(",")).toHaveLength(1000);
});

it("does not offer a ZIP for a station outside the drawn area, and recovers when the area is cleared", () => {
  useStationsStore.setState({
    area: {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [10, 10],
            [11, 10],
            [11, 11],
            [10, 10],
          ],
        ],
      ],
    },
  });
  renderWithProviders(<DownloadStationData stations={[station(37)]} />);
  fireEvent.click(
    screen.getByRole("button", { name: "Download station data" }),
  );
  expect(screen.getByRole("alert")).toHaveTextContent(
    "Outside the current drawn area",
  );
  expect(screen.queryByRole("form")).not.toBeInTheDocument();
  act(() => useStationsStore.setState({ area: null }));
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(
    fields(screen.getByRole("button", { name: "Download Timeseries ZIP" }))[
      "station-ids"
    ],
  ).toBe("37");
});

it("withdraws both forms if an open dialog's stations become excluded", () => {
  renderWithProviders(
    <DownloadStationData stations={[station(37), station(42)]} />,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Download station data" }),
  );
  expect(screen.getAllByRole("form")).toHaveLength(2);
  act(() => useStationsStore.setState({ selectedNetworks: ["/networks/99"] }));
  expect(screen.getByRole("alert")).toHaveTextContent("network is excluded");
  expect(screen.queryByRole("form")).not.toBeInTheDocument();
});

it("blocks the entire batch when only some requested stations match", () => {
  renderWithProviders(
    <DownloadStationData
      stations={[station(37), station(42, { network_uri: "/networks/99" })]}
    />,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Download station data" }),
  );
  expect(screen.getByRole("alert")).toHaveTextContent(
    "Weather station 42 (N42)",
  );
  expect(screen.queryByRole("form")).not.toBeInTheDocument();
});

it("ignores map and station criteria for a direct station download outside the area", () => {
  useStationsStore.setState({
    area: {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [10, 10],
            [11, 10],
            [11, 11],
            [10, 10],
          ],
        ],
      ],
    },
  });
  renderWithProviders(
    <DownloadStationData scope="station" stations={[station(37)]} />,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Download station data" }),
  );
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  for (const category of ["Timeseries", "Climatology"]) {
    const submitted = fields(
      screen.getByRole("button", { name: `Download ${category} ZIP` }),
    );
    expect(submitted).not.toHaveProperty("input-polygon");
    expect(submitted).toEqual({
      "station-ids": "37",
      format: "nc",
      climatology: String(category === "Climatology"),
      clip_dates: "false",
    });
  }
  expect(useStationsStore.getState().area).not.toBeNull();
});

it("downloads a station despite excluded, empty, or unavailable selector values and dates", () => {
  useStationsStore.setState({
    selectedNetworks: ["/networks/missing"],
    selectedVariables: [123456],
    selectedFrequencies: ["missing"],
    onlyWithClimatology: true,
    includeStationsWithNoObs: false,
    startDate: new Date(2050, 0, 1),
    endDate: new Date(2050, 11, 31),
  });
  renderWithProviders(
    <DownloadStationData scope="station" stations={[station(37)]} />,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Download station data" }),
  );
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  const button = screen.getByRole("button", {
    name: "Download Timeseries ZIP",
  });
  expect(fields(button)).toEqual({
    "station-ids": "37",
    format: "nc",
    climatology: "false",
    clip_dates: "false",
  });
  act(() =>
    useStationsStore.setState({
      selectedNetworks: [],
      selectedVariables: [],
      selectedFrequencies: [],
    }),
  );
  expect(fields(button)).toEqual({
    "station-ids": "37",
    format: "nc",
    climatology: "false",
    clip_dates: "false",
  });
  fireEvent.click(
    screen.getByRole("checkbox", {
      name: "Clip time series to filter date range",
    }),
  );
  expect(fields(button)).toEqual({
    "station-ids": "37",
    format: "nc",
    climatology: "false",
    clip_dates: "true",
    from_date: "2050-01-01",
    to_date: "2050-12-31",
  });
});

it("does not wait for filter metadata for a direct station download", () => {
  renderBase(<DownloadStationData scope="station" stations={[station(37)]} />);
  fireEvent.click(
    screen.getByRole("button", { name: "Download station data" }),
  );
  expect(
    screen.getByRole("button", { name: "Download Timeseries ZIP" }),
  ).toBeEnabled();
});

it("blocks invalid IDs and multiple stations in the direct download route", () => {
  renderWithProviders(
    <DownloadStationData
      scope="station"
      stations={[station(37), station(42)]}
    />,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Download station data" }),
  );
  expect(screen.getByRole("alert")).toHaveTextContent(
    "Choose exactly one station",
  );
  expect(screen.queryByRole("form")).not.toBeInTheDocument();
});
