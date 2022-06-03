import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';
import { reduce } from 'lodash/fp';
import { getObservationCounts } from
    '../../../data-services/station-data-service';

import logger from '../../../logger';
import { getTimer } from '../../../utils/timing';

import './ObservationCounts.css';

logger.configure({ active: true });
const timer = getTimer("Observation count timing")


const totalCounts = timer.timeThis("totalCounts")(
  (counts, stations) =>
    reduce((sum, station) => sum + (counts[station.id] || 0), 0)(stations)
);

function ObservationCounts({startDate, endDate, stations}) {
  const [countData, setCountData] = useState(null);

  useEffect(() => {
    // TODO: getObservationCounts should assemble params
    getObservationCounts({
      params: {
        start_date: startDate,
        end_date: endDate,
      }
    }).then(response => setCountData(response.data));
  }, [startDate, endDate]);

  if (countData === null) {
    return <p>Loading counts...</p>
  }

  timer.resetAll();
  const totalObservationCountsForStations =
    totalCounts(countData.observationCounts, stations);
  const totalClimatologyCountsForStations =
    totalCounts(countData.climatologyCounts, stations);
  timer.log();

  return (
    <Table condensed size="sm">
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
        <th>Total observations</th>
        <td className="text-right">
          {totalObservationCountsForStations.toLocaleString()}
        </td>
      </tr>
      <tr>
        <th>Total climatologies</th>
        <td className="text-right">
          {totalClimatologyCountsForStations.toLocaleString()}
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
