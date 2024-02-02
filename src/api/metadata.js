import axios from "axios";
import urljoin from "url-join";
import isString from "lodash/fp/isString";
import tap from "lodash/fp/tap";
import { mapDeep } from "../utils/fp/fp";
import { filterExpressionsParser, filterPredicate } from "./filtering";
import filter from "lodash/fp/filter";

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

export function getNetworks({ config }) {
  const parsedNetworkFilterExpressions = filterExpressionsParser(
    config.networkFilters,
  );
  const filterNetworks = filter(
    filterPredicate(parsedNetworkFilterExpressions),
  );

  return axios.get(urljoin(config.sdsUrl, "networks"), {
    params: {
      provinces: config.stationsQpProvinces,
    },
    transformResponse: axios.defaults.transformResponse.concat(filterNetworks),
  });
}

export function getVariables({ config }) {
  return axios.get(urljoin(config.sdsUrl, "variables"), {
    params: {
      provinces: config.stationsQpProvinces,
    },
  });
}

export function getFrequencies({ config }) {
  return axios.get(urljoin(config.sdsUrl, "frequencies"), {
    params: {
      provinces: config.stationsQpProvinces,
    },
  });
}

export function getHistories({ config }) {
  return axios.get(urljoin(config.sdsUrl, "histories"));
}

export function getStations({ config, getParams, axiosConfig }) {
  const parsedStationFilterExpressions = filterExpressionsParser(
    config.stationFilters,
  );
  const filterStations = filter(
    filterPredicate(parsedStationFilterExpressions),
  );

  return axios.get(urljoin(config.sdsUrl, "stations"), {
    params: {
      offset: config.stationOffset,
      limit: config.stationLimit,
      stride: config.stationStride,
      provinces: config.stationsQpProvinces,
      ...getParams,
    },
    transformResponse: axios.defaults.transformResponse.concat(
      tap((x) => console.log("raw station count", x.length)),
      filterStations,
      mapDeep(transformIso8601Date),
    ),
    ...axiosConfig,
  });
}

export const getStationById = ({ config, stationId, axiosConfig }) => {
  return axios.get(urljoin(config.sdsUrl, "stations", stationId), {
    transformResponse: axios.defaults.transformResponse.concat(
      mapDeep(transformIso8601Date),
    ),
    ...axiosConfig,
  });
};

// TODO: Connect to real API
export const getVariablePreview =
  ({ config, stationId, endDate, startDate, axiosConfig }) =>
  (variableId) => {
    return axios.get(`/pv-${stationId}-${variableId}.json`);
  };

export function getObservationCounts({
  appConfig: config,
  getParams,
  axiosConfig,
}) {
  return axios.get(urljoin(config.sdsUrl, "observations", "counts"), {
    params: {
      provinces: config.stationsQpProvinces,
      ...getParams,
    },
    ...axiosConfig,
  });
}
