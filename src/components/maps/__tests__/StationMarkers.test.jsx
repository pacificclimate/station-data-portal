import React from "react";
import { renderWithProviders } from "@/test-utils";
import { OneStationMarkers } from "../StationMarkers";
import stations from "@/utils/__test_data__/stations-bc.json";
import networks from "@/utils/__test_data__/networks-bc.json";
import { NETWORKS_QUERY_KEY } from "@/state/query-hooks/use-networks";

const station = stations[0];

it("renders without crashing", () => {
  renderWithProviders(<OneStationMarkers station={station} />, {
    withMap: true,
    // The station's network must resolve: StationTooltip reads `network.name`.
    seedQueries: [[[NETWORKS_QUERY_KEY], networks]],
  });
});
