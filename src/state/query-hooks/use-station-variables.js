import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import urljoin from "url-join";
import filter from "lodash/fp/filter";
import { useConfigContext } from "../context-hooks/use-config-context";

export const STATION_VARIABLES_QUERY_KEY = "station-variables";

export const getStationVariables = async ({ config, stationId }) => {
  const { data } = await axios.get(
    urljoin(config.sdsUrl, "stations", stationId, "variables"),
  );

  // we only care about observations variables on the front end, filter out the rest
  data.variables = filter((variable) => variable.tags.includes("observation"))(
    data.variables,
  );

  return data;
};

export const stationVariablesQuery = (config, stationId) => ({
  queryKey: [STATION_VARIABLES_QUERY_KEY, stationId],
  queryFn: () => getStationVariables({ config, stationId }),
  enabled: !!config,
  staleTime: 86400000, // 24 hours
});

export const useStationVariables = (stationId) => {
  const config = useConfigContext();

  return useQuery(stationVariablesQuery(config, stationId));
};
