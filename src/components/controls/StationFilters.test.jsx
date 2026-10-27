import React from "react";
import { beforeEach, expect, it } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import { renderWithProviders } from "@/test-utils";
import StationFilters from "./StationFilters";
import { useStationsStore } from "@/state/client/stations-store";
import { NETWORKS_QUERY_KEY } from "@/state/query-hooks/use-networks";
import { VARIABLES_QUERY_KEY } from "@/state/query-hooks/use-variables";
import { FREQUENCIES_QUERY_KEY } from "@/state/query-hooks/use-frequencies";
import { STATIONS_QUERY_KEY } from "@/state/query-hooks/use-stations";

beforeEach(() =>
  useStationsStore.setState({
    selectedNetworks: ["/networks/1"],
    selectedVariables: [1],
    selectedFrequencies: ["daily"],
    onlyWithClimatology: false,
    includeStationsWithNoObs: false,
    startDate: null,
    endDate: null,
    metadataCompact: false,
    metadataFilters: { history: [], station: [] },
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
  }),
);
it("condenses criteria into tabs while preserving choices and clearing the drawn area explicitly", () => {
  renderWithProviders(
    <StationFilters>
      <p>Attribute controls</p>
    </StationFilters>,
    {
      seedQueries: [
        [
          [NETWORKS_QUERY_KEY],
          [{ id: 1, uri: "/networks/1", name: "EC", publish: true }],
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
          ],
        ],
        [FREQUENCIES_QUERY_KEY, ["daily"]],
        [[STATIONS_QUERY_KEY], []],
      ],
    },
  );
  expect(screen.getAllByRole("tab")).toHaveLength(6);
  fireEvent.click(
    within(screen.getByRole("tabpanel")).getByRole("button", {
      name: "None",
      exact: true,
    }),
  );
  expect(useStationsStore.getState().selectedNetworks).toEqual([]);
  fireEvent.click(screen.getByRole("tab", { name: "Variables", exact: true }));
  fireEvent.click(
    within(screen.getByRole("tabpanel")).getByRole("button", {
      name: "None",
      exact: true,
    }),
  );
  expect(useStationsStore.getState().selectedVariables).toEqual([]);
  fireEvent.click(screen.getByRole("tab", { name: /Networks/ }));
  expect(useStationsStore.getState().selectedNetworks).toEqual([]);
  fireEvent.click(screen.getByRole("tab", { name: "Dates", exact: true }));
  expect(
    within(screen.getByRole("tabpanel")).getAllByRole("textbox"),
  ).toHaveLength(2);
  fireEvent.click(screen.getByRole("tab", { name: /Area/ }));
  fireEvent.click(screen.getByRole("button", { name: "Clear drawn area" }));
  expect(useStationsStore.getState().area).toBeNull();
  fireEvent.click(screen.getByRole("tab", { name: "Attributes", exact: true }));
  expect(screen.getByText("Attribute controls")).toBeVisible();
});

it("clears only Networks to All, removing its badge while retaining other tabs' filters", () => {
  useStationsStore.setState({
    selectedNetworks: [],
    selectedVariables: [],
    startDate: new Date(2000, 0, 1),
    metadataFilters: {
      history: [{ id: "Station name", value: "Brentwood" }],
      station: [],
    },
  });
  renderWithProviders(
    <StationFilters>
      <p>Attributes</p>
    </StationFilters>,
    {
      seedQueries: [
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
          ],
        ],
        [FREQUENCIES_QUERY_KEY, ["daily"]],
        [[STATIONS_QUERY_KEY], []],
      ],
    },
  );
  expect(screen.getByRole("tab", { name: "Networks 1" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Clear", exact: true }));
  fireEvent.click(
    screen.getByRole("button", { name: "Clear Networks filters" }),
  );
  expect(
    screen.getByRole("tab", { name: "Networks", exact: true }),
  ).toBeInTheDocument();
  expect(screen.getByRole("tab", { name: "Variables 1" })).toBeInTheDocument();
  expect(screen.getByRole("tab", { name: "Dates 1" })).toBeInTheDocument();
  expect(screen.getByRole("tab", { name: "Attributes 1" })).toBeInTheDocument();
  expect(useStationsStore.getState().selectedNetworks).toEqual([
    "/networks/1",
    "/networks/2",
  ]);
  expect(useStationsStore.getState().selectedVariables).toEqual([]);
  expect(useStationsStore.getState().startDate).toEqual(new Date(2000, 0, 1));
});

it("lets date filters clear before metadata is available without resetting selectors", () => {
  useStationsStore.setState({
    startDate: new Date(2000, 0, 1),
    endDate: new Date(2020, 0, 1),
  });
  renderWithProviders(<StationFilters />);
  fireEvent.click(screen.getByRole("tab", { name: "Dates 2" }));
  fireEvent.click(screen.getByRole("button", { name: "Clear", exact: true }));
  expect(
    screen.getByRole("button", { name: "Clear all filters" }),
  ).toHaveAttribute("aria-disabled", "true");
  fireEvent.click(screen.getByRole("button", { name: "Clear Dates filters" }));
  expect(
    screen.getByRole("tab", { name: "Dates", exact: true }),
  ).toBeInTheDocument();
  expect(useStationsStore.getState().startDate).toBeNull();
  expect(useStationsStore.getState().endDate).toBeNull();
  expect(useStationsStore.getState().selectedNetworks).toEqual(["/networks/1"]);
});
