import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import urljoin from "url-join";
import { useConfigContext } from "../context-hooks/use-config-context";

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
  const config = useConfigContext();
  return useQuery({
    queryKey: OBSERVATION_COUNTS_QUERY_KEY,
    queryFn: () => getObservationCounts({ config, startDate, endDate }),
    enabled: !!config,
    staleTime: 86400000, // 24 hours
  });
};
