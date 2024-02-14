import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import urljoin from "url-join";
import { mapDeep } from "../../utils/fp";
import { useConfig } from "./use-config";
import isString from "lodash/fp/isString";

export const STATION_QUERY_KEY = "station";

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

export const getStationById = async ({ config, stationId }) => {
  const { data } = await axios.get(
    urljoin(config.sdsUrl, "stations", stationId.toString()),
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

  if (!stationId) {
    throw new Error("stationId is required");
  }

  return useQuery({
    queryKey: [STATION_QUERY_KEY, stationId],
    queryFn: () => getStationById({ config, stationId }),
    enabled: !!config,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};
