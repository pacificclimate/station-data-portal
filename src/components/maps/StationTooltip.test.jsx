import React, { createRef } from "react";
import { expect, it } from "vitest";
import { act, within } from "@testing-library/react";
import { CircleMarker } from "react-leaflet";
import { renderWithProviders } from "@/test-utils";
import { NETWORKS_QUERY_KEY } from "@/state/query-hooks/use-networks";
import StationTooltip from "./StationTooltip";

it("shows only station identification in the map hover tooltip", () => {
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
        [[NETWORKS_QUERY_KEY], [{ uri: "/networks/8", name: "Test Network" }]],
      ],
    },
  );
  act(() => marker.current.openTooltip());
  const tooltip = document.querySelector(".leaflet-tooltip");
  expect(tooltip).toHaveTextContent("Test Station (Test Network)");
  expect(within(tooltip).queryByRole("button")).not.toBeInTheDocument();
  expect(within(tooltip).queryByRole("link")).not.toBeInTheDocument();
});
