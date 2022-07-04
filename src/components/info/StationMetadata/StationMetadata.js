// This component renders a table showing a selected subset of station metadata.
// This component wraps React Table v6. All props passed to this component are
// passed into React Table.
// This component also renders a download button with which users can download
// the data in the table, plus extra hidden columns, as a CSV file.

import PropTypes from 'prop-types';
import React, { useState, useMemo, useTransition } from 'react';
import {
  ButtonGroup,
  ButtonToolbar,
  ToggleButton,
  ToggleButtonGroup
} from 'react-bootstrap';

import flow from 'lodash/fp/flow';
import map from 'lodash/fp/map';
import flatten from 'lodash/fp/flatten';
import join from 'lodash/fp/join';

import InfoPopup from '../../util/InfoPopup';
import PaginatedTable from '../../controls/PaginatedTable';
import DownloadMetadata from '../../controls/DownloadMetadata';
import FrequencySelector from '../../selectors/FrequencySelector';
import logger from '../../../logger';
import {
  stationNetwork,
  uniqStationFreqs,
  uniqStationLocations,
  uniqStationNames,
  uniqStationObsPeriods,
  uniqStationVariableNames
} from '../../../utils/station-info';

import './StationMetadata.css';


logger.configure({ active: true });

const formatDate = d => d ? d.toISOString().substr(0,10) : 'unknown';
const csvArrayRep = (sep = "|") => join(sep);


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


// Return column definitions for a tabular display of metadata.
// There are two display types, compact and expanded.
// The appropriate form of data (compact or expanded) must be used with the
// column definitions. Column definitions and data (see `smtData`) are computed
// by separate functions to make memoizing them simpler and more effective.
// Column definitions include `csv` prop for representing a row value in
// a CSV download file.
function smtColumnInfo({
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
  };

  const nativeIdColumn = {
    id: 'Native ID',
    Header: 'Native ID',
    minWidth: 80,
    maxWidth: 100,
  };

  const stationIdColumn = {
    id: 'Station ID',
    Header: 'Station ID',
    minWidth: 80,
    maxWidth: 100,
  };

  const historyIdColumn = {
    id: 'History ID',
    Header: 'History ID',
    minWidth: 80,
    maxWidth: 100,
  };

  const provinceColumn = {
    id: 'Province',
    Header: 'Province',
    minWidth: 80,
    maxWidth: 100,
  };

  const variablesColumn = {
    minWidth: 100,
    maxWidth: 250,
    id: 'Variables',
    Header: 'Variables',
    sortable: false,
    Cell: row => (
      <ul className={"compact"}>
        {map(name => (<li key={name}>{name}</li>), row.value)}
      </ul>
    ),
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
          csv: csvArrayRep(),
        },
        { ...variablesColumn, accessor: uniqStationVariableNames(allVariables) },
        {
          id: '# Hx',
          Header: '# Hx',
          minWidth: 30,
          maxWidth: 30,
          accessor: station => station.histories.length,
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
        id: 'Elev',
        Header: 'Elev (m)',
        minWidth: 80,
        maxWidth: 100,
        accessor: data => data.history.elevation ?? "n/a",
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
      },
      {
        ...variablesColumn,
        accessor: data => uniqStationVariableNames(allVariables)(data.station)
      },
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
function smtData(stations, compact) {
  if (compact) {
    return stations;
  }
  // Expanded data: one history per item.
  return flow(
    map(station => map(history => ({station, history}), station.histories)),
    flatten,
  )(stations);
}


function StationMetadata({ stations, allNetworks, allVariables }) {
  const [compact, setCompact] = useState(false);
  const [isPending, startTransition] = useTransition();
  const handleChangeCompact = v => startTransition(() => setCompact(v));

  const columnInfo = useMemo(
    () => smtColumnInfo({ allNetworks, allVariables, compact }),
    [allNetworks, allVariables, compact],
  );

  const data = useMemo(
    () => smtData(stations, compact),
    [stations, compact],
  );

  // Note: Download button is rendered here because it uses `columnInfo` to
  // control what it does. We consider it an adjunct to the table.
  return (
    <div className={"StationMetadata"}>
      <ButtonToolbar>
        <ToggleButtonGroup
          type={"radio"}
          name={"compact"}
          value={compact}
          onChange={handleChangeCompact}
          className={"me-1"}
        >
          {
            [false, true].map(value => (
              <ToggleButton
                id={`stn-md-compact-${value.toString()}`}
                size={"sm"}
                variant={"outline-dark"}
                value={value}
              >
                By {value ? "Station" : "History"}
              </ToggleButton>
            ))
          }
        </ToggleButtonGroup>
        <ButtonGroup className={"me-3"}>
          <InfoPopup title={"Table Contents"}>
            <p>
              Station metadata can be displayed (and downloaded) in two formats,
              by history and by station.
            </p>
            <p>
              The by-history format presents one history per table row, repeating
              station information in each row as necessary. It is a less compact
              and readable format, but more easily mechanically processed, and
              it breaks out values such as latitude and longitude into separate
              columns.
            </p>
            <p>
              The by-station format presents one station per table row,
              and rolls up information from all histories
              for a station into a more compact and readable form. It is
              however less easily mechanically processed, and combines related
              values such as latitude and longitude into single columns.
            </p>
          </InfoPopup>
        </ButtonGroup>
        <ButtonGroup className={"me-1"}>
          <DownloadMetadata
            data={data}
            columns={columnInfo.columns}
            filename={`station-metadata-${compact ? "by-station" : "by-history"}.csv`}
          >
            Download Metadata
          </DownloadMetadata>
        </ButtonGroup>
        <ButtonGroup>
          <InfoPopup title={"Download Metadata"}>
            Download the metadata presented in the table below (all rows, not
            just those visible) as a CSV file. The downloaded file includes
            extra columns not visible in the table.
          </InfoPopup>
        </ButtonGroup>
      </ButtonToolbar>
      {
        isPending ? (<p>Loading...</p>) : (
          <PaginatedTable data={data} {...columnInfo} />
        )
      }
    </div>
  );
}

StationMetadata.propTypes = {
  stations: PropTypes.array,
  allNetworks: PropTypes.array,
  allVariables: PropTypes.array,
};

export default StationMetadata;
