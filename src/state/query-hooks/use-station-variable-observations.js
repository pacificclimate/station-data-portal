import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import urljoin from "url-join";
import formatISO from "date-fns/formatISO";
import { useConfig } from "./use-config";
import { useStore } from "../state-store";

export const STATION_VARIABLE_OBSERVATIONS_QUERY_KEY =
  "station-variable-observations";

const formatDateForApi = (date) => {
  return formatISO(date, {
    representation: "date",
  });
};

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
        start_date: formatDateForApi(startDate),
        end_date: formatDateForApi(endDate),
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

  if (!stationId || !variableId || !startDate || !endDate) {
    throw new Error(
      "stationId, variableId, startDate, and endDate are required",
    );
  }

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
