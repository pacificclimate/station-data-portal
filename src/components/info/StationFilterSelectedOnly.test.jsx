import React from "react";
import { expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test-utils";
import StationMetadata from "@/components/info/StationMetadata";
import { useStationsStore } from "@/state/client/stations-store";
import { NETWORKS_QUERY_KEY } from "@/state/query-hooks/use-networks";
import { VARIABLES_QUERY_KEY } from "@/state/query-hooks/use-variables";
import { FREQUENCIES_QUERY_KEY } from "@/state/query-hooks/use-frequencies";
it("counts all matching rows in the filter view even when Selected only is enabled in the table", () => {
  const stations = [1, 2].map((id) => ({
    id,
    native_id: `N${id}`,
    network_uri: "/networks/1",
    histories: [
      {
        id,
        station_name: `Station ${id}`,
        lat: 50,
        lon: -125,
        variable_ids: [],
        freq: "daily",
      },
    ],
  }));
  useStationsStore.setState({
    metadataCompact: false,
    metadataSelectedOnly: true,
    metadataFilters: { history: [], station: [] },
    downloadStations: [stations[0]],
    selectedNetworks: ["/networks/1"],
    selectedVariables: [],
    selectedFrequencies: ["daily"],
    includeStationsWithNoObs: false,
    onlyWithClimatology: false,
    startDate: null,
    endDate: null,
    area: null,
  });
  renderWithProviders(<StationMetadata filterOnly />, {
    stationFiltering: {
      selectedStations: stations,
      filteredStations: stations,
    },
    seedQueries: [
      [
        [NETWORKS_QUERY_KEY],
        [{ id: 1, uri: "/networks/1", name: "EC", publish: true }],
      ],
      [VARIABLES_QUERY_KEY, []],
      [FREQUENCIES_QUERY_KEY, ["daily"]],
    ],
  });
  expect(screen.getByText("2 matching rows")).toBeInTheDocument();
  expect(useStationsStore.getState().downloadStations).toHaveLength(1);
});
