import axios from 'axios';
import urljoin from 'url-join';
import flow from 'lodash/fp/flow';
import getOr from 'lodash/fp/getOr';
import isFinite from 'lodash/fp/isFinite';
import isString from 'lodash/fp/isString';
import tap from 'lodash/fp/tap';
import { mapDeep } from '../utils/fp';
import {
  filterExpressionsParser,
  filterPredicate
} from './filtering';
import filter from 'lodash/fp/filter';

const SDS_URL = process.env.REACT_APP_SDS_URL;


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
  filterExpressionsParser(process.env.REACT_APP_NETWORK_FILTERS ?? '');


const filterNetworks =
  filter(filterPredicate(parsedNetworkFilterExpressions));


export function getNetworks() {
  return axios.get(
    urljoin(SDS_URL, 'networks'),
    {
      transformResponse: axios.defaults.transformResponse.concat(
        filterNetworks,
      ),
    },
  );
}


export function getVariables() {
  return axios.get(urljoin(SDS_URL, 'variables'));
}


export function getFrequencies() {
  return axios.get(urljoin(SDS_URL, 'frequencies'));
}


export function getHistories() {
  return axios.get(urljoin(SDS_URL, 'histories'));
}


const envVarNumber = (name, fallback) =>
  flow(
    getOr(fallback, name),
    string => +string,
    value => isFinite(value) ? value : fallback,
  )(process.env);


const parsedStationFilterExpressions =
  filterExpressionsParser(process.env.REACT_APP_STATION_FILTERS ?? '');


const filterStations =
  filter(filterPredicate(parsedStationFilterExpressions));


export function getStations(params, config) {
  return axios.get(
    urljoin(SDS_URL, 'stations'),
    {
      params: {
        offset: envVarNumber('REACT_APP_STATION_OFFSET', undefined),
        limit: envVarNumber('REACT_APP_STATION_LIMIT', undefined),
        stride: envVarNumber('REACT_APP_STATION_STRIDE', undefined),
        provinces: process.env.REACT_APP_STATIONS_QP_PROVINCES,
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
    urljoin(SDS_URL, 'observations', 'counts'),
    config,
  );
}
