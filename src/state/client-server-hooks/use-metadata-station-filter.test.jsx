import { renderHook } from "@testing-library/react";
import { beforeEach, expect, it } from "vitest";
import { useStationsStore } from "@/state/client/stations-store";
import { useMetadataStationFilter } from "./use-metadata-station-filter";

beforeEach(() =>
  useStationsStore.setState({
    metadataCompact: false,
    metadataFilters: { history: [], station: [] },
  }),
);

it("does not build station histories when no attribute filters are active", () => {
  const stations = [
    {
      id: 1,
      get histories() {
        throw new Error("Unnecessary row computation");
      },
    },
  ];
  const { result } = renderHook(() =>
    useMetadataStationFilter(stations, [], []),
  );
  expect(result.current).toBe(stations);
});

it("uses the shared elevation predicate without evaluating unrelated variable labels", () => {
  useStationsStore.setState({
    metadataFilters: {
      history: [{ id: "Elevation", value: [100, null] }],
      station: [],
    },
  });
  const stations = [50, 500].map((elevation, id) => ({
    id,
    native_id: `N${id}`,
    network_uri: "/networks/1",
    histories: [{ id, elevation, variable_ids: [1] }],
  }));
  const variables = [
    {
      id: 1,
      get display_name() {
        throw new Error("Unrelated accessor evaluated");
      },
    },
  ];
  const { result } = renderHook(() =>
    useMetadataStationFilter(stations, [], variables),
  );
  expect(result.current).toEqual([stations[1]]);
});
