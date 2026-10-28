import React from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, expect, it } from "vitest";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import {
  useWorkspaceUrlState,
  decodeWorkspaceFilters,
} from "./use-workspace-url-state";
import { useStationsStore } from "@/state/client/stations-store";

beforeEach(() =>
  useStationsStore.setState({
    metadataCompact: false,
    metadataFilters: { history: [], station: [] },
    selectedNetworks: ["/networks/1"],
    selectedVariables: [1],
    selectedFrequencies: ["daily"],
    startDate: null,
    endDate: null,
    includeStationsWithNoObs: false,
    onlyWithClimatology: false,
    defaultNetworksApplied: true,
    defaultVariablesApplied: true,
    defaultFrequenciesApplied: true,
  }),
);
function Harness() {
  const { tableOpen, setTableOpen, filtersOpen } = useWorkspaceUrlState();
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <output data-testid="url">
        {location.pathname}
        {location.search}
      </output>
      <output>{tableOpen ? "Table open" : "Table closed"}</output>
      <output>{filtersOpen ? "Filters open" : "Filters closed"}</output>
      <button onClick={() => setTableOpen(!tableOpen)}>Table</button>
      <button onClick={() => navigate(-1)}>Back</button>
      <button onClick={() => navigate(1)}>Forward</button>
    </>
  );
}
it("restores shared dates, selectors, attribute filters and open panels", async () => {
  const criteria = {
    selectedNetworks: ["/networks/2"],
    selectedVariables: [7],
    selectedFrequencies: ["1-hourly"],
    startDate: "2001-01-01T00:00:00.000Z",
    metadataCompact: true,
    metadataFilters: {
      station: [{ id: "Unique Names", value: "Whistler" }],
      history: [],
    },
  };
  const query = new URLSearchParams({
    table: "1",
    filters: "1",
    criteria: JSON.stringify(criteria),
  });
  render(
    <MemoryRouter initialEntries={[`/preview/42?${query}`]}>
      <Harness />
    </MemoryRouter>,
  );
  expect(screen.getByText("Table open")).toBeInTheDocument();
  expect(screen.getByText("Filters open")).toBeInTheDocument();
  expect(useStationsStore.getState()).toMatchObject({
    ...criteria,
    startDate: new Date(criteria.startDate),
  });
  act(() =>
    useStationsStore
      .getState()
      .setMetadataFilters("station", [
        { id: "Unique Names", value: "Victoria" },
      ]),
  );
  await waitFor(() =>
    expect(screen.getByTestId("url")).toHaveTextContent("Victoria"),
  );
  expect(screen.getByTestId("url")).toHaveTextContent("/preview/42?");
});
it("supports browser Back and Forward for opening and closing the table", async () => {
  render(
    <MemoryRouter>
      <Harness />
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Table" }));
  expect(screen.getByText("Table open")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Back" }));
  await screen.findByText("Table closed");
  fireEvent.click(screen.getByRole("button", { name: "Forward" }));
  await screen.findByText("Table open");
});
it("waits for startup defaults before publishing a shareable filter snapshot", () => {
  useStationsStore.setState({
    defaultNetworksApplied: false,
    defaultVariablesApplied: false,
    defaultFrequenciesApplied: false,
  });
  render(
    <MemoryRouter>
      <Harness />
    </MemoryRouter>,
  );
  expect(screen.getByTestId("url")).not.toHaveTextContent("criteria");
  act(() => {
    useStationsStore.getState().setDefaultNetworks(["/networks/3"]);
    useStationsStore.getState().setDefaultVariables([6]);
    useStationsStore.getState().setDefaultFrequencies(["daily"]);
  });
  expect(screen.getByTestId("url")).toHaveTextContent("criteria");
  expect(useStationsStore.getState().selectedNetworks).toEqual(["/networks/3"]);
});
it("ignores malformed URL data and cannot replace store actions", () => {
  expect(decodeWorkspaceFilters("not json")).toBeNull();
  expect(
    decodeWorkspaceFilters(
      '{"setSelectedNetworks":"bad","selectedNetworks":false,"startDate":"invalid"}',
    ),
  ).toEqual({});
});

it("ignores attribute values that would be invalid for their filter controls", () => {
  expect(
    decodeWorkspaceFilters(
      JSON.stringify({
        metadataFilters: {
          history: [
            { id: "Elevation", value: 7 },
            { id: "Station name", value: [1, 2] },
          ],
          station: [],
        },
      }),
    ).metadataFilters,
  ).toEqual({ history: [], station: [] });
});

it("restores and serializes text alternatives while rejecting invalid arrays", () => {
  const metadataFilters = {
    history: [{ id: "Station name", value: ["st", "pl", "rd"] }],
    station: [{ id: "Unique Names", value: ["valley", "creek"] }],
  };
  const query = new URLSearchParams({
    table: "1",
    criteria: JSON.stringify({ metadataFilters }),
  });
  render(
    <MemoryRouter initialEntries={[`/?${query}`]}>
      <Harness />
    </MemoryRouter>,
  );
  expect(useStationsStore.getState().metadataFilters).toEqual(metadataFilters);
  act(() =>
    useStationsStore
      .getState()
      .setMetadataFilters("history", [
        { id: "Native ID", value: ["AB", "CD"] },
      ]),
  );
  const params = new URLSearchParams(
    screen.getByTestId("url").textContent.split("?")[1],
  );
  expect(JSON.parse(params.get("criteria")).metadataFilters.history).toEqual([
    { id: "Native ID", value: ["AB", "CD"] },
  ]);
  expect(
    decodeWorkspaceFilters(
      JSON.stringify({
        metadataFilters: {
          history: [
            { id: "Station name", value: ["st", 4] },
            { id: "Province", value: ["BC"] },
          ],
          station: [],
        },
      }),
    ).metadataFilters,
  ).toEqual({ history: [], station: [] });
});
