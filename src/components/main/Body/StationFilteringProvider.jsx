import { useState, useTransition, useEffect, useMemo, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import pick from "lodash/fp/pick";
import { StationFilteringContext } from "@/state/context-hooks/use-station-filtering-context";
import { useStationsStore } from "@/state/client/stations-store";
import { stationAreaFilter, stationFilter } from "@/utils/station-filtering";
import { useStations } from "@/state/query-hooks/use-stations";
import { useVariables } from "@/state/query-hooks/use-variables";
import { useNetworks } from "@/state/query-hooks/use-networks";
import { useMetadataStationFilter } from "@/state/client-server-hooks/use-metadata-station-filter";

export const StationFilteringProvider = ({ children }) => {
  const {
    includeStationsWithNoObs,
    startDate,
    endDate,
    selectedNetworks,
    selectedVariables,
    selectedFrequencies,
    onlyWithClimatology,
    area,
    metadataCompact,
    metadataFilters,
  } = useStationsStore(
    useShallow(
      pick([
        "includeStationsWithNoObs",
        "startDate",
        "endDate",
        "selectedNetworks",
        "selectedVariables",
        "selectedFrequencies",
        "onlyWithClimatology",
        "area",
        "metadataCompact",
        "metadataFilters",
      ]),
    ),
  );
  const filterKey = JSON.stringify({
    includeStationsWithNoObs,
    startDate,
    endDate,
    selectedNetworks,
    selectedVariables,
    selectedFrequencies,
    onlyWithClimatology,
    area,
    attributes: metadataFilters[metadataCompact ? "station" : "history"],
  });
  const previousFilterKey = useRef(filterKey);
  useEffect(() => {
    if (previousFilterKey.current !== filterKey) {
      previousFilterKey.current = filterKey;
      useStationsStore.getState().clearDownloadSelection();
    }
  }, [filterKey]);
  const { data: stations, isLoading: isStationsLoading } = useStations();
  const { data: variables, isLoading: isVariablesLoading } = useVariables();

  const { data: networks } = useNetworks();
  const [baseFilteredStations, setBaseFilteredStations] = useState([]);
  const filteredStations = useMetadataStationFilter(
    baseFilteredStations,
    networks,
    variables,
  );
  const selectedStations = useMemo(
    () => stationAreaFilter(area, filteredStations),
    [area, filteredStations],
  );
  const baseSelectedStations = useMemo(
    () => stationAreaFilter(area, baseFilteredStations),
    [area, baseFilteredStations],
  );
  const [isFiltering, startFilteringTransition] = useTransition();

  useEffect(() => {
    startFilteringTransition(() => {
      let compFilteredStations = [];
      if (!isStationsLoading && !isVariablesLoading) {
        compFilteredStations = stationFilter({
          filterValues: {
            includeStationsWithNoObs,
            startDate,
            endDate,
            selectedNetworks,
            selectedVariables,
            selectedFrequencies,
            onlyWithClimatology,
          },
          metadata: {
            stations,
            variables,
          },
        });
      }

      if (!isStationsLoading && !isVariablesLoading) {
        useStationsStore
          .getState()
          .pruneDownloadSelection(compFilteredStations);
      }
      setBaseFilteredStations(compFilteredStations);
    });
  }, [
    includeStationsWithNoObs,
    startDate,
    endDate,
    selectedNetworks,
    selectedVariables,
    selectedFrequencies,
    onlyWithClimatology,
    stations,
    variables,
    area,
    isStationsLoading,
    isVariablesLoading,
  ]);

  return (
    <StationFilteringContext.Provider
      value={{
        isFiltering,
        filteredStations,
        selectedStations,
        baseFilteredStations,
        baseSelectedStations,
      }}
    >
      {children}
    </StationFilteringContext.Provider>
  );
};
