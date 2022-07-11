import axios from 'axios';
import urljoin from 'url-join';
import isString from 'lodash/fp/isString';
import tap from 'lodash/fp/tap';
import { mapDeep } from '../utils/fp';
import {
  filterExpressionsParser,
  filterPredicate
} from './filtering';
import filter from 'lodash/fp/filter';

// Regex for ISO 8601 date strings; allows YYYY-MM-DD with optional T spec.
// Now you've got two problems :)
const ISO_8601 = /\d{4}-\d{2}-\d{2}(Td{2}:\d{2}:\d{2})?/;

function transformIso8601Date(value) {
  // If `value` is a string that matches the ISO 8601 date format,
  // transform it to a JS Date.
  // Otherwise return it unmolested.
  const isDateString = isString(value) && ISO_8601.test(value);
  return isDateString ?
    new Date(Date.parse(value)) :
    value
}


export function getNetworks({ config }) {
  const parsedNetworkFilterExpressions =
    filterExpressionsParser(config.networkFilters);
  const filterNetworks =
    filter(filterPredicate(parsedNetworkFilterExpressions));

  return axios.get(
    urljoin(config.sdsUrl, 'networks'),
    {
      transformResponse: axios.defaults.transformResponse.concat(
        filterNetworks,
      ),
    },
  );
}


export function getVariables({ config }) {
  return axios.get(urljoin(config.sdsUrl, 'variables'));
}


export function getFrequencies({ config }) {
  return axios.get(urljoin(config.sdsUrl, 'frequencies'));
}


export function getHistories({ config }) {
  return axios.get(urljoin(config.sdsUrl, 'histories'));
}


export function getStations({ config, getParams, getConfig }) {
  const parsedStationFilterExpressions =
    filterExpressionsParser(config.stationFilters);
  const filterStations =
    filter(filterPredicate(parsedStationFilterExpressions));

  return axios.get(
    urljoin(config.sdsUrl, 'stations'),
    {
      params: {
        offset: config.stationOffset,
        limit: config.stationLimit,
        stride: config.stationStride,
        provinces: config.stationsQpProvinces,
        ...getParams,
      },
      transformResponse: axios.defaults.transformResponse.concat(
        tap(x => console.log("raw station count", x.length)),
        filterStations,
        mapDeep(transformIso8601Date)
      ),
      ...getConfig,
    },
  );
}


export function getObservationCounts({ config, getConfig }) {
  return axios.get(
    urljoin(config.sdsUrl, 'observations', 'counts'),
    getConfig,
  );
}
