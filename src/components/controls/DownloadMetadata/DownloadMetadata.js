// This component uses the React Table infrastructure (already present for
// metadata display) to prepare the data for React CSV package, which creates
// a CSV file.
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import flow from 'lodash/fp/flow';
import map from 'lodash/fp/map';
import tap from 'lodash/fp/tap';
import { useTable } from 'react-table';
import { CSVLink } from 'react-csv';

import logger from '../../../logger';

import './DownloadMetadata.css';

logger.configure({ active: true });

function DownloadMetadata({ data, columns }) {
  const { allColumns, rows, prepareRow } = useTable({ columns, data });
  const [csvData, setCsvData] = useState([]);

  console.log("### allColumns", allColumns)
  const csvHeaders = map("Header", allColumns);
  console.log("### csvHeaders", csvHeaders)

  // Convert each row to an array of values matching header array.
  const makeCsvData = () => flow(
    tap(() => console.log("### makeCsvData called")),
    map(row => {
      prepareRow(row);
      return row.values;
    }),
    map(values =>
      map(column => {
        const value = values[column.id];
        return column.csv ?  column.csv(value) : value;
      }, allColumns)
    ),
  )(rows);

  const handleClick = (event, done) => {
    setCsvData(makeCsvData());
    done(true);
  }

  return (
    <CSVLink
      headers={csvHeaders}
      data={csvData}
      asyncOnClick={true}
      onClick={handleClick}
    >
      Download Metadata
    </CSVLink>
  );
}

DownloadMetadata.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
};

export default DownloadMetadata;
