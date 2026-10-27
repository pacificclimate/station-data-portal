// This component uses the React Table infrastructure (already present for
// metadata display) to prepare the data for React CSV package, which creates
// a CSV file.
import PropTypes from "prop-types";
import React, { useState } from "react";
import map from "lodash/fp/map";
import { useTable } from "react-table";
import { CSVLink } from "react-csv";

import logger from "@/logger";

logger.configure({ active: true });

const DownloadMetadata = React.forwardRef(function DownloadMetadata(
  {
    data,
    columns,
    filename = "station-metadata.csv",
    className = "btn btn-primary btn-sm",
    title,
    ariaLabel,
    onClick,
    children,
    ...linkProps
  },
  ref,
) {
  const csvColumns = React.useMemo(
    () => columns.filter((column) => !column.excludeFromCsv),
    [columns],
  );
  const { allColumns, rows, prepareRow } = useTable({
    columns: csvColumns,
    data,
  });

  // Data for CSV download can be bulky, so it is generated lazily.
  // This state value holds the generated data.
  const [csvData, setCsvData] = useState([]);

  const csvHeaders = map("Header", allColumns);

  // Convert each row to an array of values matching header array.
  // Column value in row is converted using column.csv function if defined.
  const makeCsvData = () =>
    map((row) => {
      prepareRow(row);
      return map((column) => {
        const value = row.values[column.id];
        return column.csv ? column.csv(value) : value;
      }, allColumns);
    }, rows);

  const handleClick = (event, done) => {
    setCsvData(makeCsvData());
    done(true);
    onClick?.(event);
  };

  return (
    <CSVLink
      {...linkProps}
      ref={(instance) => {
        if (typeof ref === "function") ref(instance?.link ?? null);
        else if (ref) ref.current = instance?.link ?? null;
      }}
      headers={csvHeaders}
      data={csvData}
      filename={filename}
      asyncOnClick={true}
      onClick={handleClick}
      className={className}
      title={title}
      aria-label={ariaLabel}
    >
      {children}
    </CSVLink>
  );
});

DownloadMetadata.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  filename: PropTypes.string,
  className: PropTypes.string,
  title: PropTypes.string,
  ariaLabel: PropTypes.string,
  onClick: PropTypes.func,
};

export default DownloadMetadata;
