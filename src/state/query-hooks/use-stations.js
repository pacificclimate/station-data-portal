import axios from "axios";
import urljoin from "url-join";
import filter from "lodash/fp/filter";
import tap from "lodash/fp/tap";
import isString from "lodash/fp/isString";
import { useQuery } from "@tanstack/react-query";
import { mapDeep } from "../../utils/fp";
import { useConfig } from "./use-config";
import { filterExpressionsParser, filterPredicate } from "./filtering";

// TODO: should this be replaced with date-fns?
// Regex for ISO 8601 date strings; allows YYYY-MM-DD with optional T spec.
// Now you've got two problems :)
const ISO_8601 = /\d{4}-\d{2}-\d{2}(Td{2}:\d{2}:\d{2})?/;

function transformIso8601Date(value) {
  // If `value` is a string that matches the ISO 8601 date format,
  // transform it to a JS Date.
  // Otherwise return it unmolested.
  const isDateString = isString(value) && ISO_8601.test(value);
  return isDateString ? new Date(Date.parse(value)) : value;
}

export const getStations = async ({ config }) => {
  const parsedStationFilterExpressions = filterExpressionsParser(
    config.stationFilters,
  );
  const filterStations = filter(
    filterPredicate(parsedStationFilterExpressions),
  );

  const { data } = await axios.get(urljoin(config.sdsUrl, "stations"), {
    params: {
      offset: config.stationOffset,
      limit: config.stationLimit,
      stride: config.stationStride,
      provinces: config.stationsQpProvinces,
    },
    transformResponse: axios.defaults.transformResponse.concat(
      tap((x) => console.log("raw station count", x.length)),
      filterStations,
      mapDeep(transformIso8601Date),
    ),
  });

  return data;
};

export const STATIONS_QUERY_KEY = "stations";

export const useStations = () => {
  const { data: config } = useConfig();

  return useQuery({
    queryKey: [STATIONS_QUERY_KEY],
    queryFn: () => getStations({ config }),
    enabled: !!config,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};
