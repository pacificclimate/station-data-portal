import { it, expect, beforeEach } from "vitest";
import React, { useState } from "react";
import { renderWithProviders } from "@/test-utils";
import StationMetadata from "./StationMetadata";
beforeEach(() =>
  useStationsStore.setState({
    metadataCompact: false,
    metadataSelectedOnly: false,
    metadataFilters: { history: [], station: [] },
    downloadStations: [],
    focusedStation: null,
    stationPopupRequest: null,
  }),
);

it("renders without crashing", () => {
  renderWithProviders(
    <StationMetadata stations={[]} allNetworks={[]} allVariables={[]} />,
  );
  expect(
    screen.getByRole("checkbox", { name: "Select all matching stations" }),
  ).toBeDisabled();
});

import { fireEvent, screen, within, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useStationsStore } from "@/state/client/stations-store";
import { NETWORKS_QUERY_KEY } from "@/state/query-hooks/use-networks";
import { VARIABLES_QUERY_KEY } from "@/state/query-hooks/use-variables";

const downloadChoice = (name) => {
  const toggle = screen.getByRole("button", { name: "Download", exact: true });
  if (toggle.getAttribute("aria-expanded") !== "true") fireEvent.click(toggle);
  return screen.getByRole("button", { name });
};

it("selects unique stations across histories and table views, and focuses their locations", () => {
  const station = {
    id: 37,
    native_id: "TEST",
    network_uri: "/networks/1",
    histories: [1, 2].map((id) => ({
      id,
      station_name: "Test Station",
      lat: 50,
      lon: -125,
      variable_ids: [],
      freq: "daily",
      min_obs_time: new Date(2000, 0, 1),
      max_obs_time: new Date(2010, 0, 1),
    })),
  };
  renderWithProviders(
    <MemoryRouter>
      <StationMetadata />
    </MemoryRouter>,
    {
      stationFiltering: { selectedStations: [station] },
      seedQueries: [
        [[NETWORKS_QUERY_KEY], [{ uri: "/networks/1", name: "Test", id: 1 }]],
        [VARIABLES_QUERY_KEY, []],
      ],
    },
  );
  const checks = screen.getAllByRole("checkbox", {
    name: "Select Test Station (TEST)",
  });
  expect(checks).toHaveLength(2);
  fireEvent.click(checks[0]);
  expect(
    screen.getAllByRole("checkbox", { name: "Select Test Station (TEST)" })[1],
  ).toBeChecked();
  expect(downloadChoice("Download selected stations (1)")).toBeEnabled();
  fireEvent.click(
    screen.getAllByRole("button", {
      name: "Locate Test Station (TEST) on map",
    })[0],
  );
  expect(useStationsStore.getState().focusedStation.id).toBe(37);
  fireEvent.click(screen.getByText("By Station"));
  expect(
    screen.getAllByRole("checkbox", { name: "Select Test Station (TEST)" }),
  ).toHaveLength(1);
  expect(
    screen.getByRole("checkbox", { name: "Select Test Station (TEST)" }),
  ).toBeChecked();
  fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
  expect(downloadChoice("Download selected stations (0)")).toHaveAttribute(
    "aria-disabled",
    "true",
  );
});

import { StationFilteringContext } from "@/state/context-hooks/use-station-filtering-context";

it("does not restore selected stations after a network is excluded and re-added while the table is hidden", () => {
  const station = {
    id: 37,
    native_id: "TEST",
    network_uri: "/networks/1",
    histories: [
      {
        id: 1,
        station_name: "Test Station",
        variable_ids: [],
        freq: "daily",
        lat: 50,
        lon: -125,
        min_obs_time: new Date(2000, 0, 1),
        max_obs_time: new Date(2010, 0, 1),
      },
    ],
  };
  function FilteringHarness() {
    const [included, setIncluded] = useState(true);
    const [visible, setVisible] = useState(true);
    return (
      <StationFilteringContext.Provider
        value={{ selectedStations: included ? [station] : [] }}
      >
        <button onClick={() => setVisible(!visible)}>Toggle table</button>
        <button onClick={() => setIncluded(false)}>Exclude network</button>
        <button onClick={() => setIncluded(true)}>Include network</button>
        <div hidden={!visible}>
          <StationMetadata />
        </div>
      </StationFilteringContext.Provider>
    );
  }
  renderWithProviders(
    <MemoryRouter>
      <FilteringHarness />
    </MemoryRouter>,
    {
      seedQueries: [
        [[NETWORKS_QUERY_KEY], [{ uri: "/networks/1", name: "Test", id: 1 }]],
        [VARIABLES_QUERY_KEY, []],
      ],
    },
  );
  fireEvent.click(
    screen.getByRole("checkbox", { name: "Select Test Station (TEST)" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Toggle table" }));
  fireEvent.click(screen.getByRole("button", { name: "Exclude network" }));
  fireEvent.click(screen.getByRole("button", { name: "Include network" }));
  fireEvent.click(screen.getByRole("button", { name: "Toggle table" }));
  expect(
    screen.getByRole("checkbox", { name: "Select Test Station (TEST)" }),
  ).not.toBeChecked();
  expect(downloadChoice("Download selected stations (0)")).toHaveAttribute(
    "aria-disabled",
    "true",
  );
});

const filterStations = ["Brentwood Bay", "Active Pass"].map((name, index) => ({
  id: index + 1,
  native_id: `N${index + 1}`,
  network_uri: "/networks/1",
  histories: [
    {
      id: index + 1,
      station_name: name,
      lat: 50,
      lon: -125,
      freq: "daily",
      variable_ids: [],
      min_obs_time: new Date(2000, 0, 1),
      max_obs_time: new Date(2010, 0, 1),
    },
  ],
}));
const renderFilterTable = () =>
  renderWithProviders(
    <MemoryRouter>
      <StationMetadata />
    </MemoryRouter>,
    {
      stationFiltering: {
        selectedStations: filterStations,
        filteredStations: filterStations,
      },
      seedQueries: [
        [[NETWORKS_QUERY_KEY], [{ uri: "/networks/1", name: "Test", id: 1 }]],
        [VARIABLES_QUERY_KEY, []],
      ],
    },
  );

it("shows only checked stations and can return to all rows", () => {
  renderFilterTable();
  fireEvent.click(
    screen.getByRole("checkbox", { name: "Select Brentwood Bay (N1)" }),
  );
  fireEvent.click(screen.getByRole("checkbox", { name: "Selected only" }));
  expect(
    screen.queryByRole("checkbox", { name: "Select Active Pass (N2)" }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("checkbox", { name: "Select Brentwood Bay (N1)" }),
  ).toBeChecked();
  fireEvent.click(screen.getByRole("checkbox", { name: "Selected only" }));
  expect(
    screen.getByRole("checkbox", { name: "Select Active Pass (N2)" }),
  ).not.toBeChecked();
});

it("applies modal filters, restores them on cancel, and clears them without losing station selections", () => {
  renderFilterTable();
  expect(screen.queryByPlaceholderText(/Contains/)).not.toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("checkbox", { name: "Select Active Pass (N2)" }),
  );
  fireEvent.click(screen.getByRole("button", { name: /Filters/ }));
  const nameFilter = within(
    screen.getByRole("group", { name: "Station Name" }),
  ).getByRole("textbox");
  fireEvent.change(nameFilter, { target: { value: "Brentwood" } });
  fireEvent.click(screen.getByRole("button", { name: "Apply" }));
  expect(
    screen.getByRole("checkbox", { name: "Select Brentwood Bay (N1)" }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("checkbox", { name: "Select Active Pass (N2)" }),
  ).not.toBeInTheDocument();
  expect(downloadChoice("Download selected stations (1)")).toBeEnabled();
  fireEvent.click(screen.getByRole("button", { name: /Filters/ }));
  fireEvent.change(
    within(screen.getByRole("group", { name: "Station Name" })).getByRole(
      "textbox",
    ),
    { target: { value: "Active" } },
  );
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(
    screen.getByRole("checkbox", { name: "Select Brentwood Bay (N1)" }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /Filters/ }));
  fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
  fireEvent.click(screen.getByRole("button", { name: "Apply" }));
  expect(
    screen.getByRole("checkbox", { name: "Select Active Pass (N2)" }),
  ).toBeChecked();
});

it("selects all matching stations across pages and deduplicates their histories", async () => {
  const stations = Array.from({ length: 13 }, (_, index) => ({
    ...filterStations[0],
    id: index + 1,
    native_id: `N${index + 1}`,
    histories: [0, 1].map((history) => ({
      ...filterStations[0].histories[0],
      id: index * 2 + history,
      station_name: index === 12 ? "Excluded" : `Match ${index + 1}`,
    })),
  }));
  renderWithProviders(
    <MemoryRouter>
      <StationMetadata />
    </MemoryRouter>,
    {
      stationFiltering: {
        selectedStations: stations,
        filteredStations: stations,
      },
      seedQueries: [
        [[NETWORKS_QUERY_KEY], [{ uri: "/networks/1", name: "Test", id: 1 }]],
        [VARIABLES_QUERY_KEY, []],
      ],
    },
  );
  fireEvent.click(screen.getByRole("button", { name: /Filters/ }));
  fireEvent.change(
    within(screen.getByRole("group", { name: "Station Name" })).getByRole(
      "textbox",
    ),
    { target: { value: "Match" } },
  );
  fireEvent.click(
    within(screen.getByRole("dialog")).getByRole("button", { name: "Apply" }),
  );
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  const all = screen.getByRole("checkbox", {
    name: "Select all matching stations",
  });
  expect(all).not.toBeChecked();
  expect(
    screen.queryByRole("button", { name: /Select all matching/ }),
  ).not.toBeInTheDocument();
  fireEvent.click(all);
  expect(
    useStationsStore.getState().downloadStations.map(({ id }) => id),
  ).toEqual(Array.from({ length: 12 }, (_, i) => i + 1));
  expect(downloadChoice("Download selected stations (12)")).toBeEnabled();
  expect(downloadChoice("Download all matching stations (12)")).toBeEnabled();
  fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
  fireEvent.click(
    screen.getByRole("checkbox", { name: "Select all matching stations" }),
  );
  expect(useStationsStore.getState().downloadStations).toHaveLength(12);
});

it("shows a mixed header checkbox for partial selections and toggles all matching stations", () => {
  renderFilterTable();
  const all = screen.getByRole("checkbox", {
    name: "Select all matching stations",
  });
  fireEvent.click(
    screen.getByRole("checkbox", { name: "Select Brentwood Bay (N1)" }),
  );
  expect(all).toBePartiallyChecked();
  fireEvent.click(all);
  expect(all).toBeChecked();
  expect(all).not.toBePartiallyChecked();
  expect(useStationsStore.getState().downloadStations).toHaveLength(2);
  fireEvent.click(all);
  expect(all).not.toBeChecked();
  expect(useStationsStore.getState().downloadStations).toEqual([]);
});

it("places selection in a separate column from centered station actions", () => {
  renderFilterTable();
  const checkbox = screen.getByRole("checkbox", {
    name: "Select Brentwood Bay (N1)",
  });
  const download = screen.getByRole("button", {
    name: "Download Brentwood Bay (N1)",
  });
  expect(checkbox.closest("td")).toHaveClass("station-selection-column");
  expect(download.closest("td")).toHaveClass("station-actions-column");
  expect(download.closest("td")).not.toContainElement(checkbox);
  expect(
    screen.getByRole("columnheader", { name: "Actions", exact: true }),
  ).toHaveClass("station-actions-column");
  expect(
    screen
      .getByRole("checkbox", { name: "Select all matching stations" })
      .closest("th"),
  ).toHaveClass("station-selection-column");
});
