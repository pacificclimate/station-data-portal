import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { act, screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "@/test-utils";
import { useStationsStore } from "@/state/client/stations-store";
import StationFocus from "./StationFocus";
import { OneStationMarkers } from "./StationMarkers";
import { NETWORKS_QUERY_KEY } from "@/state/query-hooks/use-networks";
import { VARIABLES_QUERY_KEY } from "@/state/query-hooks/use-variables";

const { flyToBounds } = vi.hoisted(() => ({ flyToBounds: vi.fn() }));
const mockMap = { flyToBounds, once: vi.fn(), off: vi.fn() };
vi.mock("react-leaflet", async (importOriginal) => ({
  ...(await importOriginal()),
  useMap: () => mockMap,
}));
beforeEach(() =>
  useStationsStore.setState({
    downloadStations: [],
    stationPopupRequest: null,
    focusedStation: null,
  }),
);
afterEach(() => {
  useStationsStore.setState({ focusedStation: null });
  flyToBounds.mockClear();
  mockMap.once.mockClear();
  mockMap.off.mockClear();
  vi.useRealTimers();
});

it("frames every valid station location, including repeated focus requests", () => {
  renderWithProviders(
    <MemoryRouter>
      <StationFocus />
    </MemoryRouter>,
    { withMap: true },
  );
  const station = {
    id: 37,
    native_id: "TEST",
    histories: [
      { lat: 50, lon: -125 },
      { lat: 51, lon: -126 },
      { lat: null, lon: null },
    ],
  };
  act(() => useStationsStore.getState().focusStation(station));
  expect(flyToBounds).toHaveBeenLastCalledWith(
    [
      [50, -125],
      [51, -126],
    ],
    { maxZoom: 10, padding: [60, 60], duration: 0.8 },
  );
  act(() => useStationsStore.getState().focusStation(station));
  expect(flyToBounds).toHaveBeenCalledTimes(2);
});

it("ignores stations without valid coordinates", () => {
  renderWithProviders(
    <MemoryRouter>
      <StationFocus />
    </MemoryRouter>,
    { withMap: true },
  );
  act(() =>
    useStationsStore
      .getState()
      .focusStation({ histories: [{ lat: null, lon: null }] }),
  );
  expect(flyToBounds).not.toHaveBeenCalled();
});

it("shows only a noninteractive ring and removes it after three pulses", () => {
  vi.useFakeTimers();
  renderWithProviders(<StationFocus />, { withMap: true });
  act(() =>
    useStationsStore.getState().focusStation({
      id: 37,
      native_id: "TEST",
      histories: [{ station_name: "Test Station", lat: 50, lon: -125 }],
    }),
  );
  const locator = document.querySelector(".station-locator");
  expect(locator).toBeInTheDocument();
  expect(locator).not.toHaveClass("leaflet-interactive");
  expect(locator).not.toHaveAttribute("tabindex");
  expect(
    document.querySelector(".station-locator-dot"),
  ).not.toBeInTheDocument();
  expect(document.querySelector(".leaflet-tooltip")).not.toBeInTheDocument();
  expect(
    screen.queryByRole("link", { name: "Preview variables" }),
  ).not.toBeInTheDocument();
  act(() => vi.advanceTimersByTime(4799));
  expect(document.querySelector(".station-locator-ring")).toBeInTheDocument();
  act(() => vi.advanceTimersByTime(1));
  expect(
    document.querySelector(".station-locator-ring"),
  ).not.toBeInTheDocument();
  expect(useStationsStore.getState().focusedStation).toBeNull();
});

it("restarts the ring and expiry when focusing the same station again", () => {
  vi.useFakeTimers();
  renderWithProviders(<StationFocus />, { withMap: true });
  const station = { id: 37, histories: [{ lat: 50, lon: -125 }] };
  act(() => useStationsStore.getState().focusStation(station));
  const firstRing = document.querySelector(".station-locator-ring");
  act(() => vi.advanceTimersByTime(3000));
  act(() => useStationsStore.getState().focusStation(station));
  expect(document.querySelector(".station-locator-ring")).not.toBe(firstRing);
  act(() => vi.advanceTimersByTime(1800));
  expect(document.querySelector(".station-locator-ring")).toBeInTheDocument();
  act(() => vi.advanceTimersByTime(3000));
  expect(
    document.querySelector(".station-locator-ring"),
  ).not.toBeInTheDocument();
});

it("stops the sonar on a station click and opens the original summary with its network colour", () => {
  const station = {
    id: 37,
    native_id: "TEST",
    network_uri: "/networks/1",
    histories: [
      {
        id: 1,
        station_name: "Test Station",
        lat: 50,
        lon: -125,
        variable_ids: [],
        freq: "daily",
        min_obs_time: null,
        max_obs_time: null,
      },
    ],
  };
  const { container } = renderWithProviders(
    <MemoryRouter>
      <StationFocus />
      <OneStationMarkers station={station} />
    </MemoryRouter>,
    {
      withMap: true,
      seedQueries: [
        [
          [NETWORKS_QUERY_KEY],
          [{ uri: "/networks/1", name: "Test Network", color: "#cc2222" }],
        ],
        [VARIABLES_QUERY_KEY, []],
      ],
    },
  );
  act(() => useStationsStore.getState().focusStation(station));
  expect(document.querySelector(".station-locator-ring")).toBeInTheDocument();
  const stationMarker = container.querySelector("path.leaflet-interactive");
  expect(stationMarker).toHaveAttribute("stroke", "#cc2222");
  fireEvent.click(stationMarker);
  expect(
    document.querySelector(".station-locator-ring"),
  ).not.toBeInTheDocument();
  expect(document.querySelector(".leaflet-popup")).toHaveTextContent(
    "Station: Test Station",
  );
  expect(document.querySelectorAll(".leaflet-popup")).toHaveLength(1);
  expect(stationMarker).toHaveAttribute("stroke", "#cc2222");
});

import StationMetadata from "@/components/info/StationMetadata";

it("opens the existing station summary after flying and shares download selection with the table", () => {
  const station = {
    id: 37,
    native_id: "TEST",
    network_uri: "/networks/1",
    histories: [
      {
        id: 1,
        station_name: "Test Station",
        lat: 50,
        lon: -125,
        variable_ids: [],
        freq: "daily",
        min_obs_time: null,
        max_obs_time: null,
      },
    ],
  };
  renderWithProviders(
    <MemoryRouter>
      <StationFocus />
      <OneStationMarkers station={station} />
      <StationMetadata />
    </MemoryRouter>,
    {
      withMap: true,
      stationFiltering: {
        selectedStations: [station],
        filteredStations: [station],
      },
      seedQueries: [
        [
          [NETWORKS_QUERY_KEY],
          [{ uri: "/networks/1", name: "Test Network", color: "#cc2222" }],
        ],
        [VARIABLES_QUERY_KEY, []],
      ],
    },
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Locate Test Station (TEST) on map" }),
  );
  expect(document.querySelector(".leaflet-popup")).not.toBeInTheDocument();
  act(() => mockMap.once.mock.calls.at(-1)[1]());
  expect(document.querySelectorAll(".leaflet-popup")).toHaveLength(1);
  expect(document.querySelector(".leaflet-popup")).toHaveTextContent(
    "Station: Test Station",
  );
  const popupSelection = screen.getByRole("checkbox", {
    name: "Select for download",
  });
  fireEvent.click(popupSelection);
  expect(
    screen.getByRole("checkbox", { name: "Select Test Station (TEST)" }),
  ).toBeChecked();
  fireEvent.click(
    screen.getByRole("button", { name: "Download", exact: true }),
  );
  expect(
    screen.getByRole("button", { name: "Download selected stations (1)" }),
  ).toBeEnabled();
  fireEvent.click(
    screen.getByRole("checkbox", { name: "Select Test Station (TEST)" }),
  );
  expect(popupSelection).not.toBeChecked();
});
