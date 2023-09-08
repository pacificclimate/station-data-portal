import flow from 'lodash/fp/flow';
import map from 'lodash/fp/map';
import flatten from 'lodash/fp/flatten';
import join from 'lodash/fp/join';

import {
  stationNetwork,
  uniqStationFreqs,
  uniqStationLocations,
  uniqStationNames,
  uniqStationObsPeriods,
  uniqStationVariableNames
} from '../../../utils/station-info';

import { filterTypes } from '../../controls/tables/filterTypes';
import DefaultColumnFilter from '../../controls/tables/column-filters/DefaultColumnFilter';

import FrequencySelector from '../../selectors/FrequencySelector';
import SelectColumnFilter from '../../controls/tables/column-filters/SelectColumnFilter';
import NumberRangeColumnFilter from '../../controls/tables/column-filters/NumberRangeColumnFilter';
import SelectArrayColumnFilter from '../../controls/tables/column-filters/SelectArrayColumnFilter';


// TODO: Move to utils
const formatDate = d => d ? d.toISOString().substr(0,10) : 'unknown';
// TODO: Move to utils
const csvArrayRep = (sep = "|") => join(sep);

// TODO: Move to utils
// Comparator for standard lexicographic ordering of arrays of values.
// Returns negative, zero, or positive integer as usual for comparators.
// Uses the natural (<, >) ordering of the array elements. No guarantees if you
// supply it with arrays with different element types (pairwise by index). You
// have been warned.
const lexCompare = (a, b) => {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i += 1) {
    if (a[i] < b[i]) {
      return -1;
    }
    if (a[i] > b[i]) {
      return 1;
    }
  }
  return a.length - b.length;
}

// Default column
const defaultColumn = {
  Filter: DefaultColumnFilter,
  doFilter: false,
};


// Return column definitions for a tabular display of metadata.
// There are two display types, compact and expanded.
// The appropriate form of data (compact or expanded) must be used with the
// column definitions. Column definitions and data (see `smtData`) are computed
// by separate functions to make memoizing them simpler and more effective.
// Column definitions include `csv` prop for representing a row value in
// a CSV download file.
export function smtColumnInfo({
  allNetworks, allVariables, compact=true
}) {
  // Columns and accessors common to both display types

  const stationNetworkIdAccessor = station => {
    const network = stationNetwork(allNetworks, station);
    return network?.id;
  };

  const networkIdColumn = {
    id: 'Network ID',
    Header: 'Network ID',
    minWidth: 80,
    maxWidth: 100,
    doFilter: true,
  };

  const stationNetworkNameAccessor = station => {
    const network = stationNetwork(allNetworks, station);
    return network ? network.name : '?';
  };

  const networkNameColumn = {
    id: 'Network Name',
    Header: 'Network Name',
    minWidth: 80,
    maxWidth: 100,
    doFilter: true,
    Filter: ({ column }) => (
      <SelectColumnFilter
        column={column}
        allValue={"*"}
      />
    ),
    filter: 'exactOrAllAsterisk',
  };

  const nativeIdColumn = {
    id: 'Native ID',
    Header: 'Native ID',
    minWidth: 80,
    maxWidth: 100,
    doFilter: true,
  };

  const stationIdColumn = {
    id: 'Station ID',
    Header: 'Station ID',
    minWidth: 80,
    maxWidth: 100,
    doFilter: true,
  };

  const historyIdColumn = {
    id: 'History ID',
    Header: 'History ID',
    minWidth: 80,
    maxWidth: 100,
    doFilter: true,
  };

  const provinceColumn = {
    id: 'Province',
    Header: 'Province',
    minWidth: 80,
    maxWidth: 100,
    doFilter: true,
    Filter: ({ column }) => (
      <SelectColumnFilter
        column={column}
        allValue={"*"}
      />
    ),
    filter: 'exactOrAllAsterisk',
  };

  const variablesColumn = {
    minWidth: 100,
    maxWidth: 250,
    id: 'Variables',
    Header: 'Variables',
    sortable: false,
    accessor: data => uniqStationVariableNames(allVariables)(data.station),
    Cell: row => (
      <ul className={"compact"}>
        {map(name => (<li key={name}>{name}</li>), row.value)}
      </ul>
    ),
    doFilter: true,
    Filter: ({ column }) => (
      <SelectArrayColumnFilter
        toString={option => option}
        column={column}
        allValue={"*"}
      />
    ),
    filter: 'includesInArrayOfString',
    csv: csvArrayRep(),
  };

  if (compact) {
    // Column definitions for a compact display of metadata.
    // A compact display rolls up information from the station histories.
    // It's not very useful for processing, but it is convenient to read.
    const historyIdsColumn = {
      minWidth: 80,
      maxWidth: 100,
      id: 'Hx Ids',
      Header: 'Hx Ids',
      accessor: station => map('id', station.histories),
      sortMethod: lexCompare,
      Cell: row => (
        <ul className={"compact"}>
          {map(id => (<li key={id}>{id}</li>), row.value)}
        </ul>
      ),
      csv: csvArrayRep(),
    };

    return {
      defaultColumn,
      filterTypes,
      columns: [
        { ...networkIdColumn, accessor: stationNetworkIdAccessor },
        { ...networkNameColumn, accessor: stationNetworkNameAccessor },
        { ...nativeIdColumn, accessor: "native_id" },
        { ...stationIdColumn, accessor: "id" },
        {
          id: 'Unique Names',
          Header: 'Unique Names',
          minWidth: 120,
          maxWidth: 200,
          accessor: uniqStationNames,
          sortMethod: lexCompare,
          Cell: row => (
            <ul className={"compact"}>
              {map(name => (<li key={name}>{name}</li>), row.value)}
            </ul>
          ),
          doFilter: true,
          filter: 'includesSubstringInArrayOfString',
          csv: csvArrayRep(),
        },
        {
          id: 'Unique Locations',
          Header: 'Unique Locations',
          minWidth: 120,
          maxWidth: 200,
          sortable: false,
          accessor: uniqStationLocations,
          Cell: row => (
            <ul className={"compact"}>
              {
                map(location => (
                  // A location is a representative history item
                  <li key={location.id}>
                    {-location.lon} W <br/>
                    {location.lat} N <br/>
                    Elev. {location.elevation} m
                  </li>
                ), row.value)
              }
            </ul>
          ),
          csv: flow(
            map(location =>
              `${-location.lon} W, ${location.lat} N, Elev. ${location.elevation} m`
            ),
            csvArrayRep(),
          ),
        },
        {
          id: 'Unique Records',
          Header: 'Unique Records',
          minWidth: 100,
          maxWidth: 100,
          sortable: false,
          accessor: uniqStationObsPeriods,
          Cell: row => (
            <ul className={"compact"}>
              {
                map(period => (
                  // A period is a representative history item
                  <li key={period.id}>
                    {formatDate(period.min_obs_time)} to <br/>
                    {formatDate(period.max_obs_time)}
                  </li>
                ), row.value)
              }
            </ul>
          ),
          csv: flow(
            map(period =>
              `${formatDate(period.min_obs_time)} to ${formatDate(period.max_obs_time)}`
            ),
            csvArrayRep()
          ),
        },
        {
          minWidth: 80,
          maxWidth: 100,
          id: 'Uniq Obs Freqs',
          Header: 'Uniq Obs Freqs',
          accessor: flow(uniqStationFreqs, map(FrequencySelector.valueToLabel)),
          sortMethod: lexCompare,
          Cell: row => (
            <ul className={"compact"}>
              {map(freq => (<li key={freq}>{freq}</li>), row.value)}
            </ul>
          ),
          doFilter: true,
          Filter: ({ column }) => (
            <SelectArrayColumnFilter
              toString={option => option}
              column={column}
              allValue={"*"}
            />
          ),
          filter: 'includesInArrayOfString',
          csv: csvArrayRep(),
        },
        { ...variablesColumn, accessor: uniqStationVariableNames(allVariables) },
        {
          id: '# Hx',
          Header: '# Hx',
          minWidth: 30,
          maxWidth: 30,
          accessor: station => station.histories.length,
          doFilter: true,
          Filter: NumberRangeColumnFilter,
          filter: 'between',
        },
        historyIdsColumn,
      ],
      hiddenColumns: [
        networkIdColumn.id,
        stationIdColumn.id,
        historyIdsColumn.id,
      ],
    };
  }

  // Return column definitions for expanded display of metadata.
  // An expanded display has one row per station history, and does not roll
  // up data shared between histories.
  return {
    defaultColumn,
    filterTypes,
    columns: [
      {
        ...networkIdColumn,
        accessor: data => stationNetworkIdAccessor(data.station)
      },
      {
        ...networkNameColumn, accessor:
          data => stationNetworkNameAccessor(data.station)
      },
      { ...nativeIdColumn, accessor: "station.native_id" },
      { ...stationIdColumn, accessor: "station.id" },
      {
        id: 'Station name',
        Header: 'Station Name',
        minWidth: 80,
        maxWidth: 100,
        accessor: data => data.history.station_name,
        doFilter: true,
      },
      { ...historyIdColumn, accessor: "history.id" },
      { ...provinceColumn, accessor: "history.province" },
      {
        id: 'Longitude',
        Header: 'Longitude',
        minWidth: 80,
        maxWidth: 100,
        accessor: data => data.history.lon,
      },
      {
        id: 'Latitude',
        Header: 'Latitude',
        minWidth: 80,
        maxWidth: 100,
        accessor: data => data.history.lat,
      },
      {
        id: 'Elevation',
        Header: 'Elevation (m)',
        minWidth: 80,
        maxWidth: 100,
        accessor: data => data.history.elevation ?? "n/a",
        doFilter: true,
        Filter: NumberRangeColumnFilter,
        filter: 'between',
      },
      {
        id: 'Record Start',
        Header: 'Record Start',
        minWidth: 80,
        maxWidth: 100,
        accessor: data => formatDate(data.history.min_obs_time),
      },
      {
        id: 'Record End',
        Header: 'Record End',
        minWidth: 80,
        maxWidth: 100,
        accessor: data => formatDate(data.history.max_obs_time),
      },
      {
        id: 'Obs Freq',
        Header: 'Obs Freq',
        minWidth: 80,
        maxWidth: 100,
        accessor: data => FrequencySelector.valueToLabel(data.history.freq),
        doFilter: true,
        Filter: ({ column }) => (
          <SelectColumnFilter
            column={column}
            allValue={"*"}
          />
        ),
        filter: 'exactOrAllAsterisk',
      },
      { ...variablesColumn },
    ],
    hiddenColumns: [
      networkIdColumn.id,
      stationIdColumn.id,
      historyIdColumn.id,
    ],
  };
}


// Return data for a tabular display of metadata.
// There are two display types, compact and expanded.
// The appropriate form of column definitions (compact or expanded) must be
// used with the data. Column definitions (see `smtColumnInfo`) and data are
// computed by separate functions to make memoizing them simpler and more
// effective.
export function smtData(stations, compact) {
  if (compact) {
    return stations;
  }
  // Expanded data: one history per item.
  return flow(
    map(station => map(history => ({station, history}), station.histories)),
    flatten,
  )(stations);
}
