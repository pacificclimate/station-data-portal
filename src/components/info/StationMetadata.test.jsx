import React from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, it, expect, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test-utils";
import StationMetadata from "./StationMetadata";
import { useStationsStore } from "@/state/client/stations-store";
import { NETWORKS_QUERY_KEY } from "@/state/query-hooks/use-networks";
import { VARIABLES_QUERY_KEY } from "@/state/query-hooks/use-variables";
import { STATIONS_QUERY_KEY } from "@/state/query-hooks/use-stations";
import { StationFilteringProvider } from "@/components/main/Body/StationFilteringProvider";

let csv;
vi.mock("react-csv", () => ({
  CSVLink: (props) => {
    csv = props;
    return (
      <button onClick={(event) => props.onClick(event, () => {})}>
        {props.children}
      </button>
    );
  },
}));
const stations = [37, 42].map((id) => ({
  id,
  native_id: `N${id}`,
  network_uri: "/networks/1",
  histories: [0, 1].map((history) => ({
    id: id * 10 + history,
    station_name: `Station ${id}`,
    lat: 50,
    lon: -125,
    elevation: 100,
    variable_ids: [],
    freq: "daily",
    min_obs_time: new Date("2000-01-01"),
    max_obs_time: new Date("2010-01-01"),
  })),
}));
const seeds = [
  [[NETWORKS_QUERY_KEY], [{ id: 1, uri: "/networks/1", name: "EC" }]],
  [VARIABLES_QUERY_KEY, []],
  [[STATIONS_QUERY_KEY], stations],
];
beforeEach(() => {
  csv = null;
  useStationsStore.setState({
    downloadStations: [],
    selectedNetworks: ["/networks/1"],
    selectedVariables: [],
    selectedFrequencies: ["daily"],
    includeStationsWithNoObs: true,
    onlyWithClimatology: false,
    area: null,
    startDate: null,
    endDate: null,
  });
});
const setup = (realFiltering = false) =>
  renderWithProviders(
    <MemoryRouter>
      {realFiltering ? (
        <StationFilteringProvider>
          <StationMetadata />
        </StationFilteringProvider>
      ) : (
        <StationMetadata />
      )}
    </MemoryRouter>,
    {
      stationFiltering: {
        selectedStations: stations,
        filteredStations: stations,
      },
      seedQueries: seeds,
    },
  );
it("renders without crashing", () => {
  renderWithProviders(<StationMetadata />);
});
it("shares station selection across history rows and views, with a single-station row download", () => {
  setup();
  fireEvent.click(
    screen.getAllByRole("checkbox", { name: "Select Station 37 (N37)" })[0],
  );
  expect(
    screen.getAllByRole("checkbox", { name: "Select Station 37 (N37)" })[1],
  ).toBeChecked();
  expect(
    screen.getByRole("button", { name: "Download selected stations (1)" }),
  ).toBeEnabled();
  expect(
    screen.getAllByRole("button", { name: "Download Station 37 (N37)" }),
  ).toHaveLength(2);
  fireEvent.click(screen.getByText("By Station"));
  expect(
    screen.getAllByRole("checkbox", { name: "Select Station 37 (N37)" }),
  ).toHaveLength(1);
  expect(
    screen.getByRole("checkbox", { name: "Select Station 37 (N37)" }),
  ).toBeChecked();
  fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
  expect(
    screen.getByRole("button", { name: "Download selected stations (0)" }),
  ).toBeDisabled();
});
it("keeps the original metadata export scope when showing only checked stations or locally filtering rows", () => {
  setup();
  fireEvent.click(
    screen.getAllByRole("checkbox", { name: "Select Station 37 (N37)" })[0],
  );
  fireEvent.click(screen.getByRole("checkbox", { name: "Selected only" }));
  expect(
    screen.queryByRole("checkbox", { name: "Select Station 42 (N42)" }),
  ).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Download Metadata" }));
  expect(csv.data).toHaveLength(4);
  fireEvent.click(screen.getByRole("checkbox", { name: "Selected only" }));
  fireEvent.change(screen.getAllByPlaceholderText("Contains ...")[0], {
    target: { value: "N37" },
  });
  expect(
    screen.queryByRole("checkbox", { name: "Select Station 42 (N42)" }),
  ).not.toBeInTheDocument();
  expect(useStationsStore.getState().downloadStations).toEqual([]);
  fireEvent.click(screen.getByRole("button", { name: "Download Metadata" }));
  expect(csv.data).toHaveLength(4);
});
it.each(["network", "polygon"])(
  "clears selection when the %s station criterion changes",
  async (criterion) => {
    setup(true);
    const check = await screen.findAllByRole("checkbox", {
      name: "Select Station 37 (N37)",
    });
    fireEvent.click(check[0]);
    expect(useStationsStore.getState().downloadStations).toHaveLength(1);
    const { act } = await import("@testing-library/react");
    act(() =>
      useStationsStore.setState(
        criterion === "network"
          ? { selectedNetworks: [] }
          : {
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
            },
      ),
    );
    await waitFor(() =>
      expect(useStationsStore.getState().downloadStations).toEqual([]),
    );
  },
);
