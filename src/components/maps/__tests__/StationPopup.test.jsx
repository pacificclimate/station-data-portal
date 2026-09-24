import React from "react";
import { renderWithProviders } from "@/test-utils";
import { CircleMarker } from "react-leaflet";
import StationPopup from "../StationPopup";
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
