import axios from "axios";
import urljoin from "url-join";
import { useQuery } from "@tanstack/react-query";
import filter from "lodash/fp/filter";
import { filterExpressionsParser, filterPredicate } from "./filtering";
import { useConfig } from "./use-config";

/**
 *
 * @param {Object}
 * @returns Promise
 */
export const getNetworks = async ({ config }) => {
  const parsedNetworkFilterExpressions = filterExpressionsParser(
    config.networkFilters,
  );
  const filterNetworks = filter(
    filterPredicate(parsedNetworkFilterExpressions),
  );

  const { data } = await axios(urljoin(config.sdsUrl, "networks"), {
    params: {
      provinces: config.stationsQpProvinces,
    },
    transformResponse: axios.defaults.transformResponse.concat(filterNetworks),
  });

  return data;
};

export const NETWORKS_QUERY_KEY = "networks";

export const useNetworks = () => {
  const { data: config } = useConfig();
  return useQuery({
    queryKey: [NETWORKS_QUERY_KEY],
    queryFn: () => getNetworks({ config }),
    enabled: !!config,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};
