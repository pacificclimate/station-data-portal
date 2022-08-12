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
  return isDateString ?
    new Date(Date.parse(value)) :
    value
}


export function getNetworks({ appConfig }) {
  const parsedNetworkFilterExpressions =
    filterExpressionsParser(appConfig.networkFilters);
  const filterNetworks =
    filter(filterPredicate(parsedNetworkFilterExpressions));

  return axios.get(
    urljoin(appConfig.sdsUrl, 'networks'),
    {
      params: {
        provinces: appConfig.stationsQpProvinces,
      },
      transformResponse: axios.defaults.transformResponse.concat(
        filterNetworks,
      ),
    },
  );
}


export function getVariables({ appConfig }) {
  return axios.get(
    urljoin(appConfig.sdsUrl, 'variables'),
    {
      params: {
        provinces: appConfig.stationsQpProvinces,
      },
    },
  );
}


export function getFrequencies({ appConfig }) {
  return axios.get(
    urljoin(appConfig.sdsUrl, 'frequencies'),
    {
      params: {
        provinces: appConfig.stationsQpProvinces,
      },
    },
  );
}


export function getHistories({ appConfig }) {
  return axios.get(urljoin(appConfig.sdsUrl, 'histories'));
}


export function getStations({ appConfig, getParams, axiosConfig }) {
  const parsedStationFilterExpressions =
    filterExpressionsParser(appConfig.stationFilters);
  const filterStations =
    filter(filterPredicate(parsedStationFilterExpressions));

  return axios.get(
    urljoin(appConfig.sdsUrl, 'stations'),
    {
      params: {
        offset: appConfig.stationOffset,
        limit: appConfig.stationLimit,
        stride: appConfig.stationStride,
        provinces: appConfig.stationsQpProvinces,
        ...getParams,
      },
      transformResponse: axios.defaults.transformResponse.concat(
        tap(x => console.log("raw station count", x.length)),
        filterStations,
        mapDeep(transformIso8601Date)
      ),
    ...axiosConfig
    },
  );
}


export function getObservationCounts({ appConfig, getParams, axiosConfig }) {
  return axios.get(
    urljoin(appConfig.sdsUrl, 'observations', 'counts'),
    {
      params: {
        provinces: appConfig.stationsQpProvinces,
        ...getParams,
      },
      ...axiosConfig,
    },
  );
}
