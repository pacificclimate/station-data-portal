import urljoin from "url-join";
import { filterExpressionsParser, filterPredicate } from "./lib/filtering";
import filter from "lodash/fp/filter";
import config from "./config";

export const getNetworks = async () => {
  const parsedNetworkFilterExpressions = filterExpressionsParser(
    config.networkFilters,
  );
  const filterNetworks = filter(
    filterPredicate(parsedNetworkFilterExpressions),
  );

  const res = await fetch(urljoin(config.sdsUrl, "networks"), {
    params: {
      provinces: config.stationsQpProvinces,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch networks: ${res.statusText}`);
  }

  return filterNetworks(await res.json());
};

export const networks = await getNetworks();

export default networks;
