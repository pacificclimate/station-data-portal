import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';
import { reduce } from 'lodash/fp';
import { getObservationCounts } from
    '../../../data-services/station-data-service';

import logger from '../../../logger';
import { getTimer } from '../../../utils/timing';

import './ObservationCounts.css';
import { useConfigContext } from '../../main/ConfigContext';

logger.configure({ active: true });
const timer = getTimer("Observation count timing")


const totalCounts = timer.timeThis("totalCounts")(
  (counts, stations) =>
    reduce((sum, station) => sum + (counts[station.id] || 0), 0)(stations)
);

function ObservationCounts({filterValues: {startDate, endDate}, clipToDate, stations}) {
  const appConfig = useConfigContext();
  const [countData, setCountData] = useState(null);

  useEffect(() => {
    setCountData(null);
    getObservationCounts({
      appConfig,
      getParams: {
        start_date: clipToDate ? startDate : undefined,
        end_date: clipToDate ? endDate : undefined,
      },
    }).then(response => setCountData(response.data));
  }, [appConfig, clipToDate, startDate, endDate]);

  const loadingMessage = "Loading ...";

  timer.resetAll();
  const totalObservationCountsForStations = countData === null ?
    loadingMessage :
    totalCounts(countData.observationCounts, stations).toLocaleString();
  const totalClimatologyCountsForStations = countData === null ?
    loadingMessage :
    totalCounts(countData.climatologyCounts, stations).toLocaleString();
  timer.log();

  const timePeriod = clipToDate ? "filter dates" : "all dates"

  return (
    <Table size="sm">
      <thead>
      <tr>
        <th colSpan={2}>Summary for selected stations</th>
      </tr>
      </thead>
      <tbody>
      <tr>
        <th>Number of stations</th>
        <td className="text-right">
          {stations.length}
        </td>
      </tr>
      <tr>
        <th>Total observations ({timePeriod})</th>
        <td className="text-right">
          {totalObservationCountsForStations}
        </td>
      </tr>
      <tr>
        <th>Total climatologies ({timePeriod})</th>
        <td className="text-right">
          {totalClimatologyCountsForStations}
        </td>
      </tr>
      </tbody>
    </Table>
  );
}

ObservationCounts.propTypes = {
  startDate: PropTypes.object,
  endDate: PropTypes.object,
  stations: PropTypes.array,
};

export default ObservationCounts;
