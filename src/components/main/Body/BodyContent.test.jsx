import React from "react";
import { beforeEach, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import {
  fireEvent,
  screen,
  within,
  waitFor,
  act,
} from "@testing-library/react";
import { renderWithProviders } from "@/test-utils";
import { BodyContent } from "./BodyContent";
import { useStationsStore } from "@/state/client/stations-store";
import { NETWORKS_QUERY_KEY } from "@/state/query-hooks/use-networks";
import { STATIONS_QUERY_KEY } from "@/state/query-hooks/use-stations";
import { StationFilteringProvider } from "./StationFilteringProvider";
import { useStationFilteringContext } from "@/state/context-hooks/use-station-filtering-context";
import { FREQUENCIES_QUERY_KEY } from "@/state/query-hooks/use-frequencies";
import { VARIABLES_QUERY_KEY } from "@/state/query-hooks/use-variables";

vi.mock("@/components/maps/StationMap", () => ({
  default: () => {
    const { filteredStations } = useStationFilteringContext();
    return (
      <div data-testid="station-map">
        Map: {filteredStations.map(({ native_id }) => native_id).join(", ")}
      </div>
    );
  },
}));
const stations = ["Brentwood", "Active Pass"].map((name, index) => ({
  id: index + 1,
  native_id: `N${index + 1}`,
  network_uri: "/networks/1",
  histories: [
    {
      id: index + 1,
      station_name: name,
      variable_ids: [],
      freq: "daily",
      lat: 50,
      lon: -125,
      elevation: 100,
      min_obs_time: new Date(2000, 0, 1),
      max_obs_time: new Date(2010, 0, 1),
    },
  ],
}));
beforeEach(() =>
  useStationsStore.setState({
    downloadStations: [],
    metadataCompact: false,
    metadataSelectedOnly: false,
    metadataFilters: { history: [], station: [] },
    selectedNetworks: ["/networks/1"],
    focusedStation: null,
    defaultNetworksApplied: true,
    defaultVariablesApplied: true,
    defaultFrequenciesApplied: true,
    includeStationsWithNoObs: true,
    startDate: null,
    endDate: null,
    selectedVariables: [],
    selectedFrequencies: ["daily"],
    onlyWithClimatology: false,
    area: null,
  }),
);
const setup = (realFiltering = false, extraSeeds = []) =>
  renderWithProviders(
    <MemoryRouter>
      {realFiltering ? (
        <StationFilteringProvider>
          <BodyContent />
        </StationFilteringProvider>
      ) : (
        <BodyContent />
      )}
    </MemoryRouter>,
    {
      stationFiltering: {
        selectedStations: stations,
        filteredStations: stations,
      },
      seedQueries: [
        [[STATIONS_QUERY_KEY], stations],
        [
          [NETWORKS_QUERY_KEY],
          [
            {
              id: 1,
              uri: "/networks/1",
              name: "EC",
              long_name: "Environment Canada",
              color: "#cc2222",
            },
          ],
        ],
        [VARIABLES_QUERY_KEY, []],
        [FREQUENCIES_QUERY_KEY, ["daily"]],
        ...extraSeeds,
      ],
    },
  );

it("starts with a map and three tools, with an expandable network legend", () => {
  setup();
  expect(screen.getByTestId("station-map")).toBeInTheDocument();
  expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  const tools = within(
    screen.getByRole("navigation", { name: "Station tools" }),
  );
  expect(tools.getAllByRole("button")).toHaveLength(3);
  expect(
    screen
      .getByRole("navigation", { name: "Station tools" })
      .closest(".station-map-workspace"),
  ).not.toBeNull();
  fireEvent.click(tools.getByRole("button", { name: "Network legend" }));
  const legend = screen.getByRole("complementary", { name: "Network legend" });
  expect(legend).toHaveTextContent("EC");
  fireEvent.click(within(legend).getByText("EC"));
  expect(within(legend).getByText("Environment Canada")).toBeVisible();
  fireEvent.click(
    within(legend).getByRole("button", { name: "Close network legend" }),
  );
  expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
});

it("shares map and table filters and preserves filters and download selection when panels close", async () => {
  setup();
  fireEvent.click(screen.getByRole("button", { name: /^Table/ }));
  const table = await screen.findByRole("region", { name: "Station table" });
  fireEvent.click(
    within(table).getByRole("checkbox", { name: "Select Brentwood (N1)" }),
  );
  fireEvent.click(within(table).getByRole("button", { name: /Filters/ }));
  const filters = await screen.findByRole("dialog", {
    name: "Station filters",
  });
  for (const name of ["Network Name", "Variables", "Obs Freq"]) {
    expect(
      within(filters).queryByRole("group", { name }),
    ).not.toBeInTheDocument();
  }
  expect(table).not.toBeVisible();
  expect(screen.getByTestId("station-map")).toBeVisible();
  expect(filters).toHaveAttribute("aria-modal", "false");
  expect(
    within(filters).getByRole("tablist", { name: "Filter by" }),
  ).toBeInTheDocument();
  fireEvent.click(within(filters).getByRole("tab", { name: /Attributes/ }));
  fireEvent.change(
    within(
      within(filters).getByRole("group", { name: "Station Name" }),
    ).getByRole("textbox"),
    { target: { value: "Brentwood" } },
  );
  fireEvent.click(within(filters).getByRole("button", { name: "Done" }));
  const restored = await screen.findByRole("region", { name: "Station table" });
  expect(
    within(restored).getByRole("checkbox", { name: "Select Brentwood (N1)" }),
  ).toBeChecked();
  expect(
    within(restored).queryByRole("checkbox", {
      name: "Select Active Pass (N2)",
    }),
  ).not.toBeInTheDocument();
  expect(
    within(restored).getByRole("columnheader", { name: "Location" }),
  ).toBeInTheDocument();
  expect(
    within(restored).queryByRole("columnheader", { name: "Longitude" }),
  ).not.toBeInTheDocument();
  fireEvent.click(
    within(restored).getByRole("button", { name: "Close panel" }),
  );
  await waitFor(() =>
    expect(
      screen.queryByRole("region", { name: "Station table" }),
    ).not.toBeInTheDocument(),
  );
  fireEvent.click(screen.getByRole("button", { name: /^Table/ }));
  const reopened = await screen.findByRole("region", { name: "Station table" });
  expect(
    within(reopened).getByRole("checkbox", { name: "Select Brentwood (N1)" }),
  ).toBeChecked();
  expect(
    within(reopened).queryByRole("checkbox", {
      name: "Select Active Pass (N2)",
    }),
  ).not.toBeInTheDocument();
  fireEvent.click(
    within(reopened).getByRole("button", {
      name: "Locate Brentwood (N1) on map",
    }),
  );
  expect(reopened).toBeVisible();
  expect(screen.getByTestId("station-map")).toBeVisible();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(document.querySelector(".modal-backdrop")).not.toBeInTheDocument();
  expect(useStationsStore.getState().focusedStation.id).toBe(1);
});

it("uses one right-hand panel for either table or filters, with both filter buttons opening the same view", () => {
  setup();
  const tools = within(
    screen.getByRole("navigation", { name: "Station tools" }),
  );
  fireEvent.click(tools.getByRole("button", { name: "Filters" }));
  expect(screen.getByRole("dialog", { name: "Station filters" })).toBeVisible();
  expect(
    screen.queryByRole("region", { name: "Station table" }),
  ).not.toBeInTheDocument();
  fireEvent.click(tools.getByRole("button", { name: "Filters" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  fireEvent.click(tools.getByRole("button", { name: "Table" }));
  let table = screen.getByRole("region", { name: "Station table" });
  fireEvent.click(within(table).getByRole("button", { name: /Filters/ }));
  expect(table).not.toBeVisible();
  expect(screen.getByRole("dialog", { name: "Station filters" })).toBeVisible();
  expect(screen.getByTestId("station-map")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Done" }));
  expect(table).toBeVisible();
  fireEvent.click(tools.getByRole("button", { name: "Filters" }));
  expect(table).not.toBeVisible();
  fireEvent.click(tools.getByRole("button", { name: "Table" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(table).toBeVisible();
});

it("filters map and table together live, including zero matches and clearing", async () => {
  setup(true);
  const map = screen.getByTestId("station-map");
  await waitFor(() => expect(map).toHaveTextContent("N1, N2"));
  fireEvent.click(screen.getByRole("button", { name: /^Table/ }));
  const table = screen.getByRole("region", { name: "Station table" });
  fireEvent.click(
    within(table).getByRole("checkbox", { name: "Select Brentwood (N1)" }),
  );
  expect(useStationsStore.getState().downloadStations).toHaveLength(1);
  fireEvent.click(within(table).getByRole("button", { name: /Filters/ }));
  const dialog = screen.getByRole("dialog", { name: "Station filters" });
  fireEvent.click(within(dialog).getByRole("tab", { name: /Attributes/ }));
  const nameFilter = within(
    within(dialog).getByRole("group", { name: "Station Name" }),
  ).getByRole("textbox");
  fireEvent.change(nameFilter, { target: { value: "Brentwood" } });
  await waitFor(() => expect(map).toHaveTextContent("Map: N1"));
  await waitFor(() =>
    expect(useStationsStore.getState().downloadStations).toEqual([]),
  );
  expect(map).not.toHaveTextContent("N2");
  fireEvent.change(nameFilter, { target: { value: "No such station" } });
  await waitFor(() => expect(map).toHaveTextContent(/^Map:$/));
  fireEvent.click(
    within(dialog).getByRole("button", { name: "Clear", exact: true }),
  );
  fireEvent.click(
    within(dialog).getByRole("button", { name: "Clear Attributes filters" }),
  );
  await waitFor(() => expect(map).toHaveTextContent("N1, N2"));
  fireEvent.click(within(dialog).getByRole("button", { name: "Done" }));
  expect(
    within(table).getByRole("checkbox", { name: "Select Active Pass (N2)" }),
  ).toBeInTheDocument();
});

it.each([
  [
    "network",
    () =>
      useStationsStore
        .getState()
        .setSelectedNetworks(["/networks/1", "/networks/2"]),
  ],
  [
    "polygon",
    () =>
      useStationsStore.getState().setArea({
        type: "MultiPolygon",
        coordinates: [
          [
            [
              [-126, 49],
              [-124, 49],
              [-124, 51],
              [-126, 51],
              [-126, 49],
            ],
          ],
        ],
      }),
  ],
  [
    "date",
    () => useStationsStore.getState().setStartDate(new Date(2000, 0, 1)),
  ],
  ["variable", () => useStationsStore.getState().setSelectedVariables([1])],
  [
    "frequency",
    () =>
      useStationsStore.getState().setSelectedFrequencies(["daily", "1-hourly"]),
  ],
])(
  "clears the entire download selection on a %s filter change while the table is closed",
  async (_name, change) => {
    setup(true);
    await waitFor(() =>
      expect(screen.getByTestId("station-map")).toHaveTextContent("N1, N2"),
    );
    act(() => useStationsStore.getState().selectStationsForDownload(stations));
    expect(useStationsStore.getState().downloadStations).toHaveLength(2);
    act(change);
    await waitFor(() =>
      expect(useStationsStore.getState().downloadStations).toEqual([]),
    );
    expect(
      screen.queryByRole("region", { name: "Station table" }),
    ).not.toBeInTheDocument();
  },
);

it("preserves download selections when opening or closing panels", async () => {
  setup(true);
  await waitFor(() =>
    expect(screen.getByTestId("station-map")).toHaveTextContent("N1, N2"),
  );
  act(() => useStationsStore.getState().selectStationsForDownload(stations));
  fireEvent.click(screen.getByRole("button", { name: "Table" }));
  fireEvent.click(
    within(screen.getByRole("navigation", { name: "Station tools" })).getByRole(
      "button",
      { name: "Filters" },
    ),
  );
  fireEvent.click(screen.getByRole("button", { name: "Close filters" }));
  fireEvent.click(screen.getByRole("button", { name: "Close panel" }));
  expect(useStationsStore.getState().downloadStations).toHaveLength(2);
});

it("counts shared criteria in both table views and identifies view-specific attributes", () => {
  useStationsStore.setState({
    includeStationsWithNoObs: false,
    selectedNetworks: ["/networks/1"],
    selectedVariables: [1],
    selectedFrequencies: ["daily"],
  });
  setup(false, [
    [
      [NETWORKS_QUERY_KEY],
      [
        { id: 1, uri: "/networks/1", name: "EC", color: "red" },
        { id: 2, uri: "/networks/2", name: "OTHER" },
      ],
    ],
    [
      VARIABLES_QUERY_KEY,
      [
        { id: 1, display_name: "Temperature" },
        { id: 2, display_name: "Rain" },
      ],
    ],
    [FREQUENCIES_QUERY_KEY, ["daily", "1-hourly"]],
  ]);
  const tools = within(
    screen.getByRole("navigation", { name: "Station tools" }),
  );
  expect(tools.getByRole("button", { name: "Filters" })).toHaveTextContent("3");
  fireEvent.click(tools.getByRole("button", { name: "Table" }));
  const table = screen.getByRole("region", { name: "Station table" });
  expect(
    within(table).getByRole("button", { name: "Filters 3" }),
  ).toHaveAttribute(
    "title",
    "3 station criteria and 0 attribute filters active",
  );
  fireEvent.click(within(table).getByText("By Station"));
  expect(
    within(table).getByRole("button", { name: "Filters 3" }),
  ).toBeInTheDocument();
  fireEvent.click(within(table).getByText("By History"));
  fireEvent.click(tools.getByRole("button", { name: "Filters" }));
  const panel = screen.getByRole("dialog", { name: "Station filters" });
  expect(
    within(panel).getByRole("heading", { name: "Station criteria 3" }),
  ).toBeInTheDocument();
  expect(
    within(panel).getByText(
      "Active: Networks, Variables, Observation frequency",
    ),
  ).toBeInTheDocument();
  fireEvent.click(within(panel).getByRole("tab", { name: /Attributes/ }));
  fireEvent.change(
    within(
      within(panel).getByRole("group", { name: "Elevation (m)" }),
    ).getByPlaceholderText("Min"),
    { target: { value: "50" } },
  );
  expect(tools.getByRole("button", { name: "Filters" })).toHaveTextContent("4");
  expect(
    within(panel).getByRole("heading", { name: "By History attributes 1" }),
  ).toBeInTheDocument();
  fireEvent.click(within(panel).getByRole("button", { name: "Done" }));
  fireEvent.click(within(table).getByText("By Station"));
  expect(
    within(table).getByRole("button", { name: "Filters 3" }),
  ).toBeInTheDocument();
  fireEvent.click(tools.getByRole("button", { name: "Filters" }));
  const reopened = screen.getByRole("dialog", { name: "Station filters" });
  fireEvent.click(within(reopened).getByRole("tab", { name: /Attributes/ }));
  expect(
    within(reopened).getByRole("heading", { name: "By Station attributes 0" }),
  ).toBeInTheDocument();
  expect(
    within(reopened).getByText(/By History has 1 saved attribute filter/),
  ).toBeInTheDocument();
});

it("groups table controls and downloads the checked or matching stations from one menu", async () => {
  setup(true, [[FREQUENCIES_QUERY_KEY, ["daily"]]]);
  fireEvent.click(screen.getByRole("button", { name: /^Table/ }));
  const table = screen.getByRole("region", { name: "Station table" });
  expect(within(table).getByLabelText("Matching stations")).toHaveTextContent(
    "2 of 2 stations match (2 histories)",
  );
  for (const name of ["View", "Select", "Export"]) {
    expect(within(table).getByRole("group", { name })).toBeInTheDocument();
  }
  expect(within(table).queryByText(/Showing .* rows/)).not.toBeInTheDocument();
  fireEvent.click(
    within(table).getByRole("button", { name: "Station table help" }),
  );
  expect(within(table).getByText("Explore stations")).toBeVisible();
  fireEvent.click(
    within(table).getByRole("button", { name: "Station table help" }),
  );
  expect(within(table).queryByText("Explore stations")).not.toBeInTheDocument();

  const toggle = within(table).getByRole("button", {
    name: "Download",
    exact: true,
  });
  fireEvent.click(toggle);
  expect(
    within(table).getByRole("button", {
      name: "Download selected stations (0)",
    }),
  ).toHaveAttribute("aria-disabled", "true");
  expect(
    within(table).getByRole("link", { name: "Download Metadata" }),
  ).toBeInTheDocument();
  fireEvent.click(
    within(table).getByRole("button", {
      name: "Download all matching stations (2)",
    }),
  );
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  let dialog = screen.getByRole("dialog", { name: "Download station data" });
  expect(
    new FormData(
      within(dialog).getByRole("form", { name: "Download Timeseries ZIP" }),
    ).get("station-ids"),
  ).toBe("1,2");
  fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );

  fireEvent.click(
    within(table).getByRole("checkbox", { name: "Select Brentwood (N1)" }),
  );
  fireEvent.click(toggle);
  fireEvent.click(
    within(table).getByRole("button", {
      name: "Download selected stations (1)",
    }),
  );
  dialog = screen.getByRole("dialog", { name: "Download station data" });
  expect(
    new FormData(
      within(dialog).getByRole("form", { name: "Download Timeseries ZIP" }),
    ).get("station-ids"),
  ).toBe("1");
});

it("clears all criteria and both saved attribute views, resetting counts and the table together", async () => {
  const observed = stations.map((station, index) => ({
    ...station,
    network_uri: `/networks/${index + 1}`,
    histories: station.histories.map((history) => ({
      ...history,
      variable_ids: [index + 1],
      freq: index ? "1-hourly" : "daily",
    })),
  }));
  useStationsStore.setState({
    selectedNetworks: ["/networks/1"],
    selectedVariables: [1],
    selectedFrequencies: ["daily"],
    startDate: new Date(2001, 0, 1),
    endDate: new Date(2005, 0, 1),
    includeStationsWithNoObs: true,
    metadataSelectedOnly: true,
    area: {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [-126, 49],
            [-124, 49],
            [-124, 51],
            [-126, 51],
            [-126, 49],
          ],
        ],
      ],
    },
    metadataFilters: {
      history: [{ id: "Station name", value: "Brentwood" }],
      station: [{ id: "Unique Names", value: "Ghost" }],
    },
  });
  setup(true, [
    [[STATIONS_QUERY_KEY], observed],
    [
      [NETWORKS_QUERY_KEY],
      [
        { id: 1, uri: "/networks/1", name: "EC", publish: true },
        { id: 2, uri: "/networks/2", name: "OTHER", publish: true },
        { id: 3, uri: "/networks/3", name: "Hidden", publish: false },
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
    [FREQUENCIES_QUERY_KEY, ["daily", "1-hourly"]],
  ]);
  const tools = within(
    screen.getByRole("navigation", { name: "Station tools" }),
  );
  fireEvent.click(tools.getByRole("button", { name: "Table" }));
  fireEvent.click(tools.getByRole("button", { name: "Filters" }));
  const filters = screen.getByRole("dialog", { name: "Station filters" });
  fireEvent.click(
    within(filters).getByRole("button", { name: "Clear", exact: true }),
  );
  fireEvent.click(
    within(filters).getByRole("button", { name: "Clear all filters" }),
  );
  await waitFor(() =>
    expect(screen.getByTestId("station-map")).toHaveTextContent("N1, N2"),
  );
  expect(tools.getByRole("button", { name: "Filters" })).toHaveAttribute(
    "title",
    "Station filters: 0 criteria, 0 attributes",
  );
  expect(
    within(filters).getByRole("heading", { name: "Station criteria 0" }),
  ).toBeInTheDocument();
  expect(within(filters).getByLabelText("Matching stations")).toHaveTextContent(
    "2 of 2 stations match",
  );
  expect(useStationsStore.getState().metadataFilters).toEqual({
    history: [],
    station: [],
  });
  expect(useStationsStore.getState().selectedNetworks).toEqual([
    "/networks/1",
    "/networks/2",
  ]);
  fireEvent.click(within(filters).getByRole("button", { name: "Done" }));
  const table = screen.getByRole("region", { name: "Station table" });
  expect(
    within(table).getByRole("button", { name: "Filters", exact: true }),
  ).toBeInTheDocument();
  expect(
    within(table).getByRole("checkbox", { name: "Selected only" }),
  ).not.toBeChecked();
  expect(
    within(table).getByRole("checkbox", { name: "Select Brentwood (N1)" }),
  ).toBeInTheDocument();
  expect(
    within(table).getByRole("checkbox", { name: "Select Active Pass (N2)" }),
  ).toBeInTheDocument();
  fireEvent.click(within(table).getByText("By Station"));
  expect(
    within(table).getByRole("button", { name: "Filters", exact: true }),
  ).toBeInTheDocument();
  fireEvent.click(tools.getByRole("button", { name: "Filters" }));
  const reopened = screen.getByRole("dialog", { name: "Station filters" });
  fireEvent.click(
    within(reopened).getByRole("tab", { name: "Attributes", exact: true }),
  );
  expect(
    within(reopened).getByRole("heading", { name: "By Station attributes 0" }),
  ).toBeInTheDocument();
});

it("uses name alternatives with OR, other fields with AND, and the same matching IDs for map/table selection", async () => {
  const alternatives = ["ST Valley", "PL Creek", "Hill Rd", "Cove"].map(
    (name, index) => ({
      ...stations[0],
      id: index + 1,
      native_id: `N${index + 1}`,
      histories: [
        {
          ...stations[0].histories[0],
          id: index + 1,
          station_name: name,
          elevation: [10, 100, 200, 100][index],
        },
      ],
    }),
  );
  setup(true, [[[STATIONS_QUERY_KEY], alternatives]]);
  const tools = within(
    screen.getByRole("navigation", { name: "Station tools" }),
  );
  const map = screen.getByTestId("station-map");
  fireEvent.click(tools.getByRole("button", { name: "Table" }));
  fireEvent.click(tools.getByRole("button", { name: "Filters" }));
  const filters = screen.getByRole("dialog", { name: "Station filters" });
  fireEvent.click(
    within(filters).getByRole("tab", { name: "Attributes", exact: true }),
  );
  const name = within(
    within(filters).getByRole("group", { name: "Station Name" }),
  ).getByRole("textbox");
  for (const term of ["st", "PL", "rd"]) {
    fireEvent.change(name, { target: { value: term } });
    fireEvent.keyDown(name, { key: "Enter" });
  }
  await waitFor(() => expect(map).toHaveTextContent("Map: N1, N2, N3"));
  expect(map).not.toHaveTextContent("N4");
  expect(
    within(filters).getByRole("heading", { name: "By History attributes 1" }),
  ).toBeInTheDocument();
  fireEvent.change(
    within(
      within(filters).getByRole("group", { name: "Elevation (m)" }),
    ).getByPlaceholderText("Min"),
    { target: { value: "150" } },
  );
  await waitFor(() => expect(map).toHaveTextContent(/^Map: N3$/));
  expect(
    within(filters).getByRole("heading", { name: "By History attributes 2" }),
  ).toBeInTheDocument();
  fireEvent.click(within(filters).getByRole("button", { name: "Done" }));
  const table = screen.getByRole("region", { name: "Station table" });
  expect(
    within(table).getByRole("checkbox", { name: "Select Hill Rd (N3)" }),
  ).toBeInTheDocument();
  expect(
    within(table).queryByRole("checkbox", { name: "Select ST Valley (N1)" }),
  ).not.toBeInTheDocument();
  fireEvent.click(
    within(table).getByRole("checkbox", {
      name: "Select all matching stations",
    }),
  );
  expect(
    useStationsStore.getState().downloadStations.map(({ id }) => id),
  ).toEqual([3]);
  fireEvent.click(tools.getByRole("button", { name: "Filters" }));
  const reopened = screen.getByRole("dialog", { name: "Station filters" });
  fireEvent.click(within(reopened).getByRole("tab", { name: /Attributes/ }));
  expect(
    within(reopened).getByRole("button", {
      name: "Remove st from Station Name",
    }),
  ).toBeInTheDocument();
  fireEvent.click(
    within(reopened).getByRole("button", {
      name: "Remove PL from Station Name",
    }),
  );
  fireEvent.click(
    within(
      within(reopened).getByRole("group", { name: "Elevation (m)" }),
    ).getByTitle("Clear filter values"),
  );
  await waitFor(() => expect(map).toHaveTextContent(/^Map: N1, N3$/));
  expect(useStationsStore.getState().downloadStations).toEqual([]);
  fireEvent.click(
    within(reopened).getByRole("button", { name: "Clear", exact: true }),
  );
  fireEvent.click(
    within(reopened).getByRole("button", { name: "Clear Attributes filters" }),
  );
  await waitFor(() => expect(map).toHaveTextContent("Map: N1, N2, N3, N4"));
  expect(
    within(reopened).getByRole("heading", { name: "By History attributes 0" }),
  ).toBeInTheDocument();
  expect(
    within(
      within(reopened).getByRole("group", { name: "Station Name" }),
    ).getByRole("textbox"),
  ).toHaveValue("");
});
