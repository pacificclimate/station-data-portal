import React from "react";
import { beforeEach, expect, it } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { renderWithProviders as renderBase, testConfig } from "@/test-utils";
import { useStationsStore } from "@/state/client/stations-store";
import DownloadStationData from "./DownloadStationData";

const station = (id) => ({
  id,
  native_id: `N${id}`,
  histories: [{ station_name: `Weather station ${id}` }],
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
  renderWithProviders(
    <DownloadStationData stations={[station(37), station(42), station(37)]} />,
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
