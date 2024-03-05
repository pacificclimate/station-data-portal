import { useState, useTransition, useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { StationFilteringContext } from "@/state/context-hooks/use-station-filtering-context";
import { useStationsStore } from "@/state/client/stations-store";
import { stationAreaFilter, stationFilter } from "@/utils/station-filtering";
import { useStations } from "@/state/query-hooks/use-stations";
import { useVariables } from "@/state/query-hooks/use-variables";

export const StationFilteringProvider = ({ children }) => {
  console.log("provider render");
  const {
    includeStationsWithNoObs,
    startDate,
    endDate,
    selectedNetworks,
    selectedVariables,
    selectedFrequencies,
    onlyWithClimatology,
    area,
  } = useStationsStore(
    useShallow((state) => ({
      includeStationsWithNoObs: state.includeStationsWithNoObs,
      startDate: state.startDate,
      endDate: state.endDate,
      selectedNetworks: state.selectedNetworks,
      selectedVariables: state.selectedVariables,
      selectedFrequencies: state.selectedFrequencies,
      onlyWithClimatology: state.onlyWithClimatology,
      stations: state.stations,
      variables: state.variables,
      area: state.area,
    })),
  );
  const { data: stations, isLoading: isStationsLoading } = useStations();
  const { data: variables, isLoading: isVariablesLoading } = useVariables();

  const [filteredStations, setFilteredStations] = useState([]);
  const [selectedStations, setSelectedStations] = useState([]);
  const [isFiltering, startFilteringTransition] = useTransition();

  useEffect(() => {
    startFilteringTransition(() => {
      let compFilteredStations = [];
      if (!isStationsLoading && !isVariablesLoading) {
        compFilteredStations = stationFilter({
          filterValues: {
            includeStationsWithNoObs: includeStationsWithNoObs,
            startDate: startDate,
            endDate: endDate,
            selectedNetworks: selectedNetworks,
            selectedVariables: selectedVariables,
            selectedFrequencies: selectedFrequencies,
            onlyWithClimatology: onlyWithClimatology,
          },
          metadata: {
            stations: stations,
            variables: variables,
          },
        });
      }

      const compSelectedStations = stationAreaFilter(
        area,
        compFilteredStations,
      );
      setFilteredStations(compFilteredStations);
      setSelectedStations(compSelectedStations);
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
      value={{ isFiltering, filteredStations, selectedStations }}
    >
      {children}
    </StationFilteringContext.Provider>
  );
};
