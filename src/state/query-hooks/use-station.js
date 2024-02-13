import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import urljoin from "url-join";
import { useConfig } from "./use-config";

export const STATION_QUERY_KEY = "station";

export const getStationById = async ({ config, stationId }) => {
  const { data } = await axios.get(
    urljoin(config.sdsUrl, "stations", stationId),
    {
      transformResponse: axios.defaults.transformResponse.concat(
        mapDeep(transformIso8601Date),
      ),
    },
  );
  return data;
};

export const useStation = (stationId) => {
  const { data: config } = useConfig();

  return useQuery({
    queryKey: [STATION_QUERY_KEY, stationId],
    queryFn: () => getStationById({ config, stationId }),
    enabled: !!config,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};
