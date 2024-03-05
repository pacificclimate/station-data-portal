import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import flow from "lodash/fp/flow";
import map from "lodash/fp/map";
import max from "date-fns/max";
import min from "date-fns/min";
import subMonths from "date-fns/subMonths";
import parseIso from "date-fns/parseISO";
import { useStore } from "../client/state-store";
import { useStationVariables } from "../query-hooks/use-station-variables";

const getMaxEndDate = flow(
  map("max_obs_time"), // (string []) Pluck max_obs_time from variable objects (ISO 8601 date string)
  map(parseIso), // (Date []) Parse ISO 8601 date strings to JS Date objects
  max, // (Date) Get the latest date
);
const getMinStartDate = flow(
  map("min_obs_time"), // (string []) Pluck min_obs_time from variable objects (ISO 8601 date string)
  map(parseIso), // (Date []) Parse ISO 8601 date strings to JS Date objects
  min, // (Date) Get the earliest date
);

/**
 * Integration between server components loaded for the Preview route and the zustand store for that page
 * @param {number} stationId
 * @returns {object} data, isLoading, isError from stationVariables. stationId as passed in.
 */
export const useStationVariablesDefaults = (stationId) => {
  const { data, isLoading, isError } = useStationVariables(stationId);
  const selectedDuration = useStore((state) => state.selectedDuration);
  const storeActions = useStore(
    useShallow((state) => ({
      setStationId: state.setStationId,
      setSelectedEndDate: state.setSelectedEndDate,
      setMaxEndDate: state.setMaxEndDate,
      setMinStartDate: state.setMinStartDate,
    })),
  );

  useEffect(() => {
    // if stationid changes, this will clear default ranges and set duration back to default
    storeActions.setStationId(stationId);

    if (data && data.variables?.length > 0) {
      const maxEndDate = getMaxEndDate(data.variables);
      const selectedStartDate = subMonths(maxEndDate, selectedDuration);

      console.log("### selected date range", selectedStartDate, maxEndDate);

      // set default ranges
      storeActions.setMinStartDate(getMinStartDate(data.variables));
      storeActions.setMaxEndDate(maxEndDate);
      // end date will also update start date based on selected duration.
      storeActions.setSelectedEndDate(maxEndDate);
    }
  }, [stationId, data]);

  return { isLoading, isError, stationId, data };
};
