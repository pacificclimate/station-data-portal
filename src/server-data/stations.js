import axios from "axios";
import urljoin from "url-join";
import isString from "lodash/fp/isString";
import flow from "lodash/fp/flow";
import tap from "lodash/fp/tap";
import { mapDeep } from "../utils/fp/fp";
import { filterExpressionsParser, filterPredicate } from "./lib/filtering";
import filter from "lodash/fp/filter";
import config from "../server-data/config";

// TODO: Think about replacing parameter `appConfig` in data services with
//  a module-local variable and an exported setter, which would be called
//  from app initialization. Neither is a nice solution.

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

export const getStations = async () => {
  const parsedStationFilterExpressions = filterExpressionsParser(
    config.stationFilters,
  );
  const filterStations = filter(
    filterPredicate(parsedStationFilterExpressions),
  );

  const res = await fetch(urljoin(config.sdsUrl, "stations"), {
    params: {
      offset: config.stationOffset,
      limit: config.stationLimit,
      stride: config.stationStride,
      provinces: config.stationsQpProvinces,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch stations: ${res.statusText}`);
  }

  return flow(
    tap((x) => console.log("raw station count", x.length)),
    filterStations,
    mapDeep(transformIso8601Date),
  )(await res.json());
};

export const stations = await getStations();

export default stations;
