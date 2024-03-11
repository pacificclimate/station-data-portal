import { useState, useTransition, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import pick from "lodash/fp/pick";
import { StationFilteringContext } from "@/state/context-hooks/use-station-filtering-context";
import { useStationsStore } from "@/state/client/stations-store";
import { stationAreaFilter, stationFilter } from "@/utils/station-filtering";
import { useStations } from "@/state/query-hooks/use-stations";
import { useVariables } from "@/state/query-hooks/use-variables";

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
      ]),
    ),
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
