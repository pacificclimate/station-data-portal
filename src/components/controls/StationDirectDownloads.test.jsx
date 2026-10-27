import React from "react";
import { beforeEach, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { renderWithProviders } from "@/test-utils";
import StationMetadata from "@/components/info/StationMetadata";
import StationPreview from "@/components/preview/StationPreview";
import { useStationsStore } from "@/state/client/stations-store";
import { useStore } from "@/state/client/state-store";
import { NETWORKS_QUERY_KEY } from "@/state/query-hooks/use-networks";
import { VARIABLES_QUERY_KEY } from "@/state/query-hooks/use-variables";
import { FREQUENCIES_QUERY_KEY } from "@/state/query-hooks/use-frequencies";
import { STATIONS_QUERY_KEY } from "@/state/query-hooks/use-stations";
import { STATION_QUERY_KEY } from "@/state/query-hooks/use-station";

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useLoaderData: () => ({ stationId: 37 }),
}));
vi.mock("@/state/client-server-hooks/use-station-variables-defaults", () => ({
  useStationVariablesDefaults: () => ({
    data: { variables: [] },
    isLoading: false,
    isError: false,
  }),
}));
const station = {
  id: 37,
  native_id: "N37",
  network_uri: "/networks/1",
  histories: [
    {
      id: 1,
      station_name: "Test Station",
      variable_ids: [],
      freq: "daily",
      lat: 50,
      lon: -125,
      elevation: 100,
      min_obs_time: new Date("2000-01-01"),
      max_obs_time: new Date("2010-01-01"),
    },
  ],
};
beforeEach(() => {
  useStore.setState({ stationId: 37 });
  useStationsStore.setState({
    selectedNetworks: [],
    selectedVariables: [],
    selectedFrequencies: [],
    onlyWithClimatology: true,
    includeStationsWithNoObs: false,
    startDate: new Date(2050, 0, 1),
    endDate: new Date(2050, 11, 31),
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
    downloadStations: [],
    metadataCompact: false,
    metadataSelectedOnly: false,
    metadataFilters: { history: [], station: [] },
  });
});
const renderRoute = (node) =>
  renderWithProviders(<MemoryRouter>{node}</MemoryRouter>, {
    stationFiltering: {
      selectedStations: [station],
      filteredStations: [station],
    },
    seedQueries: [
      [[STATIONS_QUERY_KEY], [station]],
      [[STATION_QUERY_KEY, 37], station],
      [
        [NETWORKS_QUERY_KEY],
        [{ id: 1, uri: "/networks/1", name: "EC", publish: true }],
      ],
      [VARIABLES_QUERY_KEY, []],
      [FREQUENCIES_QUERY_KEY, []],
    ],
  });
const expectDirectRequest = () => {
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  for (const category of ["Timeseries", "Climatology"]) {
    const form = screen.getByRole("form", { name: `Download ${category} ZIP` });
    expect(Object.fromEntries(new FormData(form))).toEqual({
      "station-ids": "37",
      format: "nc",
      climatology: String(category === "Climatology"),
      clip_dates: "false",
    });
  }
};
it("makes the table row action a direct download despite all conflicting station criteria", () => {
  renderRoute(<StationMetadata />);
  fireEvent.click(
    screen.getByRole("button", { name: "Download Test Station (N37)" }),
  );
  expectDirectRequest();
});
it("makes the standalone or modal preview action a direct station download", () => {
  renderRoute(<StationPreview stationId={37} />);
  fireEvent.click(
    screen.getByRole("button", { name: "Download station data" }),
  );
  expectDirectRequest();
});
