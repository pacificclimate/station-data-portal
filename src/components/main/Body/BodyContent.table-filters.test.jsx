import React from "react";
import { beforeEach, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { renderWithProviders, testConfig } from "@/test-utils";
import { BodyContent } from "./BodyContent";
import { StationFilteringProvider } from "./StationFilteringProvider";
import { useStationFilteringContext } from "@/state/context-hooks/use-station-filtering-context";
import { useStationsStore } from "@/state/client/stations-store";
import { STATIONS_QUERY_KEY } from "@/state/query-hooks/use-stations";
import { NETWORKS_QUERY_KEY } from "@/state/query-hooks/use-networks";
import { VARIABLES_QUERY_KEY } from "@/state/query-hooks/use-variables";
import { FREQUENCIES_QUERY_KEY } from "@/state/query-hooks/use-frequencies";
vi.mock("@/components/maps/StationMap", () => ({
  default: () => {
    const { filteredStations } = useStationFilteringContext();
    return (
      <div data-testid="map">
        Map: {filteredStations.map(({ native_id }) => native_id).join(", ")}
      </div>
    );
  },
}));
const stations = ["ST Valley", "Plover Creek"].map((name, index) => ({
  id: index + 1,
  native_id: `N${index + 1}`,
  network_uri: "/networks/1",
  histories: [
    {
      id: index + 1,
      station_name: name,
      lat: 50,
      lon: -125,
      elevation: 100,
      variable_ids: [index + 1],
      freq: "daily",
      min_obs_time: new Date("2000-01-01"),
      max_obs_time: new Date("2020-01-01"),
    },
  ],
}));
beforeEach(() =>
  useStationsStore.setState({
    selectedNetworks: ["/networks/1", "/networks/2"],
    selectedVariables: [1, 2],
    selectedFrequencies: ["daily"],
    includeStationsWithNoObs: false,
    onlyWithClimatology: false,
    startDate: null,
    endDate: null,
    area: null,
    downloadStations: [],
    metadataCompact: false,
    metadataSelectedOnly: false,
    metadataFilters: { history: [], station: [] },
    defaultNetworksApplied: true,
    defaultVariablesApplied: true,
    defaultFrequenciesApplied: true,
  }),
);
const setup = () =>
  renderWithProviders(
    <MemoryRouter>
      <StationFilteringProvider>
        <BodyContent />
      </StationFilteringProvider>
    </MemoryRouter>,
    {
      config: {
        ...testConfig,
        defaultTab: "Metadata",
        adjustableColumnWidthsDefault: [6, 6],
      },
      seedQueries: [
        [[STATIONS_QUERY_KEY], stations],
        [
          [NETWORKS_QUERY_KEY],
          [
            { id: 1, uri: "/networks/1", name: "EC", publish: true },
            { id: 2, uri: "/networks/2", name: "OTHER", publish: true },
          ],
        ],
        [
          VARIABLES_QUERY_KEY,
          [
            {
              id: 1,
              display_name: "Temperature",
              standard_name: "air_temperature",
              tags: [],
            },
            {
              id: 2,
              display_name: "Rain",
              standard_name: "precipitation_amount",
              tags: [],
            },
          ],
        ],
        [FREQUENCIES_QUERY_KEY, ["daily"]],
      ],
    },
  );
const table = () =>
  screen.getByRole("tabpanel", { name: "Station Metadata", exact: true });
const filters = () =>
  screen.getByRole("tabpanel", { name: "Station Filters", exact: true });
it("opens shared filters through the existing tabs, updates map/table matches, and downloads the matching selection", async () => {
  setup();
  await waitFor(() =>
    expect(screen.getByTestId("map")).toHaveTextContent("Map: N1, N2"),
  );
  fireEvent.click(
    within(table()).getByRole("checkbox", { name: "Select ST Valley (N1)" }),
  );
  fireEvent.click(within(table()).getByRole("button", { name: /Filters/ }));
  expect(
    screen.getByRole("tab", { name: "Station Filters", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  fireEvent.click(
    within(filters()).getByRole("tab", { name: "Attributes", exact: true }),
  );
  const name = within(
    within(filters()).getByRole("group", { name: "Station Name" }),
  ).getByRole("textbox");
  fireEvent.change(name, { target: { value: "st" } });
  fireEvent.keyDown(name, { key: "Enter" });
  await waitFor(() =>
    expect(screen.getByTestId("map")).toHaveTextContent(/^Map: N1$/),
  );
  expect(useStationsStore.getState().downloadStations).toEqual([]);
  expect(
    within(filters()).getByRole("heading", { name: "By History attributes 1" }),
  ).toBeInTheDocument();
  fireEvent.click(within(filters()).getByRole("button", { name: "Done" }));
  expect(
    screen.getByRole("tab", { name: "Station Metadata", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  expect(
    within(table()).queryByRole("checkbox", {
      name: "Select Plover Creek (N2)",
    }),
  ).not.toBeInTheDocument();
  fireEvent.click(
    within(table()).getByRole("checkbox", {
      name: "Select all matching stations",
    }),
  );
  expect(
    useStationsStore.getState().downloadStations.map(({ id }) => id),
  ).toEqual([1]);
  fireEvent.click(
    within(table()).getByRole("button", { name: "Download", exact: true }),
  );
  fireEvent.click(
    within(table()).getByRole("button", {
      name: "Download selected stations (1)",
    }),
  );
  const dialog = screen.getByRole("dialog", { name: "Download station data" });
  const form = within(dialog).getByRole("form", {
    name: "Download Timeseries ZIP",
  });
  expect(new FormData(form).get("station-ids")).toBe("1");
  expect(new FormData(form).get("network-name")).toBe("EC,OTHER");
  fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  fireEvent.click(within(table()).getByRole("button", { name: /Filters/ }));
  fireEvent.click(within(filters()).getByRole("tab", { name: /Attributes/ }));
  fireEvent.click(
    within(filters()).getByRole("button", { name: "Clear", exact: true }),
  );
  fireEvent.click(
    within(filters()).getByRole("button", { name: "Clear Attributes filters" }),
  );
  await waitFor(() =>
    expect(screen.getByTestId("map")).toHaveTextContent("Map: N1, N2"),
  );
});
it("clears both attribute views and all criteria together without leaving stale filter counts", async () => {
  useStationsStore.setState({
    selectedNetworks: ["/networks/1"],
    selectedVariables: [1],
    startDate: new Date(2001, 0, 1),
    metadataSelectedOnly: true,
    metadataFilters: {
      history: [{ id: "Station name", value: ["st"] }],
      station: [{ id: "Unique Names", value: ["ghost"] }],
    },
  });
  setup();
  fireEvent.click(within(table()).getByRole("button", { name: /Filters/ }));
  expect(within(filters()).getByText("1 matching rows")).toBeInTheDocument();
  fireEvent.click(
    within(filters()).getByRole("button", { name: "Clear", exact: true }),
  );
  fireEvent.click(
    within(filters()).getByRole("button", { name: "Clear all filters" }),
  );
  await waitFor(() =>
    expect(screen.getByTestId("map")).toHaveTextContent("Map: N1, N2"),
  );
  expect(
    within(filters()).getByRole("heading", { name: "Station criteria 0" }),
  ).toBeInTheDocument();
  expect(within(filters()).getByText("2 matching rows")).toBeInTheDocument();
  expect(useStationsStore.getState().metadataFilters).toEqual({
    history: [],
    station: [],
  });
  fireEvent.click(within(filters()).getByRole("button", { name: "Done" }));
  expect(
    within(table()).getByRole("checkbox", { name: "Selected only" }),
  ).not.toBeChecked();
  expect(
    within(table()).getByRole("button", { name: "Filters", exact: true }),
  ).toBeInTheDocument();
  fireEvent.click(within(table()).getByText("By Station"));
  expect(
    within(table()).getByRole("button", { name: "Filters", exact: true }),
  ).toBeInTheDocument();
});

it("keeps the Station Data tab's ZIP membership in sync with shared attribute filters", async () => {
  useStationsStore.setState({
    metadataFilters: {
      history: [{ id: "Station name", value: ["st"] }],
      station: [],
    },
  });
  setup();
  await waitFor(() =>
    expect(screen.getByTestId("map")).toHaveTextContent(/^Map: N1$/),
  );
  fireEvent.click(
    screen.getByRole("tab", { name: "Station Data", exact: true }),
  );
  const data = screen.getByRole("tabpanel", {
    name: "Station Data",
    exact: true,
  });
  fireEvent.click(
    within(data).getByRole("button", {
      name: "Download matching station data (1)",
    }),
  );
  const dialog = screen.getByRole("dialog", { name: "Download station data" });
  const form = within(dialog).getByRole("form", {
    name: "Download Timeseries ZIP",
  });
  expect(new FormData(form).get("station-ids")).toBe("1");
  expect(new FormData(form).has("input-polygon")).toBe(true);
});
