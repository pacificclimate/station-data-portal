// This component renders a table showing a selected subset of station metadata.
// This component also renders a download button with which users can download
// the data in the table, plus extra hidden columns, as a CSV file.

import PropTypes from 'prop-types';
import React, { useState, useMemo, useTransition } from 'react';
import {
  Button,
  ButtonGroup,
  ButtonToolbar,
  ToggleButton,
  ToggleButtonGroup
} from 'react-bootstrap';

import InfoPopup from '../../util/InfoPopup';
import FancyTable from '../../controls/tables/FancyTable';
import DownloadMetadata from '../../controls/DownloadMetadata';
import { smtColumnInfo, smtData } from './column-definitions';
import logger from '../../../logger';

import './StationMetadata.css';


logger.configure({ active: true });

function StationMetadata({
  stations,
  metadata: {
    networks: allNetworks,
    variables: allVariables
  },
}) {
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
      <ButtonToolbar className="justify-content-between">
        {/* Table help popup */}
        <ButtonToolbar>
          <ButtonGroup className={"me-1"}>
            <Button variant="outline-secondary" size={"sm"} as={"div"} disabled={true}>
              Table Help
            </Button>
          </ButtonGroup>
          <ButtonGroup className={"me-3"}>
            <InfoPopup title={"Table Help"}>
              <p>
                This table allows you to explore station metadata dynamically.
              </p>
              <p>
                The controls in this table affect only the <em>display</em> of
                what is first selected by the <strong>Station Filters</strong> tab
                and the map.
                Nor does it affect the metadata that is downloaded by
                the <strong>Download Metadata</strong> button.
              </p>
              <p>
                Many table columns have filtering controls.
                They allow through only rows that
                match what you select or enter in them.
                The count of rows that pass all the filters
                is shown at the top of the table header, above the column labels
                and the filter controls.
              </p>
              <p>
                For example,
                the Network Name column filter allows you to select
                just one (or all) of the networks first selected by
                the <strong>Networks</strong> control in
                the <strong>Station Filters</strong> tab).
                Similarly, to find a station or stations whose name partially
                matches a given string, enter that string in the Station Name
                column's filter.
              </p>
            </InfoPopup>
          </ButtonGroup>
        </ButtonToolbar>

        {/* Table data organization buttons */}
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
                  key={value.toString()}
                  size={"sm"}
                  variant={"outline-success"}
                  value={value}
                >
                  By {value ? "Station" : "History"}
                </ToggleButton>
              ))
            }
          </ToggleButtonGroup>
          <ButtonGroup className={"me-3"}>
            <InfoPopup title={"Table Data Organization"}>
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
        </ButtonToolbar>

        {/* Table download button */}
        <ButtonToolbar>
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
      </ButtonToolbar>
      {
        isPending ? (<p>Loading...</p>) : (
          <FancyTable data={data} {...columnInfo} />
        )
      }
    </div>
  );
}

StationMetadata.propTypes = {
  stations: PropTypes.array,
  metadata: PropTypes.object,
};

export default StationMetadata;
