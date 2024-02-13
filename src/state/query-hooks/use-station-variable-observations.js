import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import urljoin from "url-join";
import { useConfig } from "./use-config";

export const STATION_VARIABLE_OBSERVATIONS_QUERY_KEY =
  "station-variable-observations";

export const getStationVariablesObservations = async ({
  config,
  stationId,
  variableId,
  startDate,
  endDate,
}) => {
  const { data } = await axios.get(
    urljoin(
      config.sdsUrl,
      "stations",
      stationId.toString(),
      "variables",
      variableId.toString(),
      "observations",
    ),
    {
      params: {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      },
    },
  );
  return data;
};

export const useStationVariableObservations = (
  stationId,
  variableId,
  startDate,
  endDate,
) => {
  const { data: config } = useConfig();

  return useQuery({
    queryKey: [
      STATION_VARIABLE_OBSERVATIONS_QUERY_KEY,
      stationId,
      variableId,
      startDate,
      endDate,
    ],
    queryFn: () =>
      getStationVariablesObservations({
        config,
        stationId,
        variableId,
        startDate,
        endDate,
      }),
    enabled: !!config,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};
