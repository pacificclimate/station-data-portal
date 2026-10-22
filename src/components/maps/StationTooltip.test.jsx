import React, { createRef } from "react";
import { expect, it } from "vitest";
import { act, fireEvent, screen } from "@testing-library/react";
import { CircleMarker } from "react-leaflet";
import { renderWithProviders } from "@/test-utils";
import { NETWORKS_QUERY_KEY } from "@/state/query-hooks/use-networks";
import { useStationsStore } from "@/state/client/stations-store";
import { VARIABLES_QUERY_KEY } from "@/state/query-hooks/use-variables";
import { FREQUENCIES_QUERY_KEY } from "@/state/query-hooks/use-frequencies";
import StationTooltip from "./StationTooltip";

it("opens station downloads from the interactive map tooltip", () => {
  useStationsStore.setState({
    selectedNetworks: ["/networks/8"],
    selectedVariables: [],
    selectedFrequencies: [],
    includeStationsWithNoObs: true,
    onlyWithClimatology: false,
    area: null,
  });
  const marker = createRef();
  const station = {
    id: 37,
    network_uri: "/networks/8",
    histories: [{ station_name: "Test Station" }],
  };
  renderWithProviders(
    <CircleMarker ref={marker} center={[50, -125]}>
      <StationTooltip station={station} />
    </CircleMarker>,
    {
      withMap: true,
      seedQueries: [
        [VARIABLES_QUERY_KEY, []],
        [FREQUENCIES_QUERY_KEY, []],
        [[NETWORKS_QUERY_KEY], [{ uri: "/networks/8", name: "Test Network" }]],
      ],
    },
  );
  act(() => marker.current.openTooltip());
  fireEvent.click(
    screen.getByRole("button", { name: "Download station data" }),
  );
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  const button = screen.getByRole("button", {
    name: "Download Timeseries ZIP",
  });
  expect(button.form).toHaveAttribute(
    "action",
    "https://example.invalid/data/agg",
  );
  expect(new FormData(button.form).get("station-ids")).toBe("37");
});
