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
import appConfig from '../utils/configuration';

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


const parsedNetworkFilterExpressions =
  filterExpressionsParser(appConfig.networkFilters);

const filterNetworks =
  filter(filterPredicate(parsedNetworkFilterExpressions));


export function getNetworks() {
  return axios.get(
    urljoin(appConfig.sdsUrl, 'networks'),
    {
      transformResponse: axios.defaults.transformResponse.concat(
        filterNetworks,
      ),
    },
  );
}


export function getVariables() {
  return axios.get(urljoin(appConfig.sdsUrl, 'variables'));
}


export function getFrequencies() {
  return axios.get(urljoin(appConfig.sdsUrl, 'frequencies'));
}


export function getHistories() {
  return axios.get(urljoin(appConfig.sdsUrl, 'histories'));
}


const parsedStationFilterExpressions =
  filterExpressionsParser(appConfig.stationFilters);

const filterStations =
  filter(filterPredicate(parsedStationFilterExpressions));


export function getStations(params, config) {
  return axios.get(
    urljoin(appConfig.sdsUrl, 'stations'),
    {
      params: {
        offset: appConfig.stationOffset,
        limit: appConfig.stationLimit,
        stride: appConfig.stationStride,
        provinces: appConfig.stationsQpProvinces,
        ...params,
      },
      transformResponse: axios.defaults.transformResponse.concat(
        tap(x => console.log("raw station count", x.length)),
        filterStations,
        mapDeep(transformIso8601Date)
      ),
      ...config,
    },
  );
}


export function getObservationCounts(config) {
  return axios.get(
    urljoin(appConfig.sdsUrl, 'observations', 'counts'),
    config,
  );
}
