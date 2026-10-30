import { beforeEach, expect, it } from "vitest";
import React, { createRef } from "react";
import { act, fireEvent, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useStationsStore } from "@/state/client/stations-store";
import { FREQUENCIES_QUERY_KEY } from "@/state/query-hooks/use-frequencies";
import { renderWithProviders } from "@/test-utils";
import { CircleMarker } from "react-leaflet";
import StationPopup from "./StationPopup";
import { NETWORKS_QUERY_KEY } from "@/state/query-hooks/use-networks";
import { VARIABLES_QUERY_KEY } from "@/state/query-hooks/use-variables";

const station = {
  histories: [
    {
      country: null,
      edate: null,
      elevation: 1430.0,
      freq: "hourly",
      id: 33,
      lat: 60.5992,
      lon: -136.208,
      province: "YT",
      sdate: null,
      station_name: "Kusawa",
      tz_offset: null,
      uri: "/histories/33",
      variable_uris: [],
      variable_ids: [],
    },
  ],
  id: 37,
  max_obs_time: null,
  min_obs_time: null,
  native_id: "YPKU",
  network_uri: "/networks/8",
  uri: "/stations/37",
};

// Must match the station's `network_uri` above: StationPopup looks its network
// up by uri, and reads `network.color` without guarding against a miss.
const network = {
  color: "#3fbd46",
  id: 8,
  long_name: "Yukon Parks",
  name: "YP",
  publish: true,
  uri: "/networks/8",
  virtual: null,
};

it("renders without crashing", () => {
  const { lat, lon } = station.histories[0];
  // In the app this popup is always rendered inside a station marker, and
  // Leaflet cannot place a popup that has no parent layer or position.
  renderWithProviders(
    <CircleMarker center={[lat, lon]}>
      <StationPopup station={station} />
    </CircleMarker>,
    {
      withMap: true,
      seedQueries: [
        [[NETWORKS_QUERY_KEY], [network]],
        [VARIABLES_QUERY_KEY, []],
      ],
    },
  );
});

beforeEach(() =>
  useStationsStore.setState({
    area: null,
    downloadStations: [],
    selectedNetworks: ["/networks/8"],
    selectedVariables: [],
    selectedFrequencies: [],
    includeStationsWithNoObs: true,
    onlyWithClimatology: false,
    startDate: null,
    endDate: null,
  }),
);

it("keeps a direct download available outside the area while preventing selected-set membership", () => {
  useStationsStore.setState({
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
  const marker = createRef();
  renderWithProviders(
    <MemoryRouter>
      <CircleMarker ref={marker} center={station.histories[0]}>
        <StationPopup station={station} />
      </CircleMarker>
    </MemoryRouter>,
    {
      withMap: true,
      seedQueries: [
        [[NETWORKS_QUERY_KEY], [network]],
        [VARIABLES_QUERY_KEY, []],
        [FREQUENCIES_QUERY_KEY, []],
      ],
    },
  );
  act(() => marker.current.openPopup());
  const check = screen.getByRole("checkbox", { name: "Select for download" });
  expect(check).toBeDisabled();
  expect(screen.getByText(/Outside the drawn area/)).toBeVisible();
  fireEvent.click(check);
  expect(useStationsStore.getState().downloadStations).toEqual([]);
  fireEvent.click(
    screen.getByRole("button", { name: "Download station data" }),
  );
  const form = screen.getByRole("form", { name: "Download Timeseries ZIP" });
  expect(new FormData(form).get("station-ids")).toBe("37");
  expect(new FormData(form).has("input-polygon")).toBe(false);
});
