import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import urljoin from "url-join";
import { useConfig } from "./use-config";

export const OBSERVATION_COUNTS_QUERY_KEY = ["observation-counts"];

export const getObservationCounts = async ({ config, startDate, endDate }) => {
  const { data } = await axios.get(
    urljoin(config.sdsUrl, "observations", "counts"),
    {
      params: {
        provinces: config.stationsQpProvinces,
        start_date: startDate?.toISOString(),
        end_date: endDate?.toISOString(),
      },
    },
  );

  return data;
};

export const useObservationCounts = (startDate, endDate) => {
  const { data: config } = useConfig();
  return useQuery({
    queryKey: OBSERVATION_COUNTS_QUERY_KEY,
    queryFn: () => getObservationCounts({ config, startDate, endDate }),
    enabled: !!config,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};
