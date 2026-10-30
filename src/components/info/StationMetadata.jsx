// This component renders a table showing a selected subset of station metadata.
// This component also renders a download button with which users can download
// the data in the table, plus extra hidden columns, as a CSV file.

import PropTypes from "prop-types";
import React, { useState, useMemo, useTransition, useEffect } from "react";
import {
  Button,
  ButtonGroup,
  ButtonToolbar,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  Row,
  Form,
} from "react-bootstrap";

import { Download } from "react-bootstrap-icons";
import DownloadStationData from "@/components/controls/DownloadStationData";
import { useStationsStore } from "@/state/client/stations-store";
import { stationDisplayName } from "@/utils/station-info";
import InfoPopup from "@/components/util/InfoPopup";
import FancyTable from "@/components/controls/tables/FancyTable";
import DownloadMetadata from "@/components/controls/DownloadMetadata";
import SelectionCounts from "@/components/info/SelectionCounts";
import { smtColumnInfo, smtData } from "./column-definitions";
import logger from "@/logger";
import { useNetworks } from "@/state/query-hooks/use-networks";
import { useVariables } from "@/state/query-hooks/use-variables";
import { useStationFilteringContext } from "@/state/context-hooks/use-station-filtering-context";

import "./StationMetadata.css";

logger.configure({ active: true });

function StationMetadata({ rowClasses }) {
  const { data: allNetworks } = useNetworks();
  const { data: allVariables } = useVariables();
  const { selectedStations: stations } = useStationFilteringContext();

  const downloadStations = useStationsStore((state) => state.downloadStations);
  const setStationDownloadSelected = useStationsStore(
    (state) => state.setStationDownloadSelected,
  );
  const clearDownloadSelection = useStationsStore(
    (state) => state.clearDownloadSelection,
  );
  const pruneDownloadSelection = useStationsStore(
    (state) => state.pruneDownloadSelection,
  );
  const [selectedOnly, setSelectedOnly] = useState(false);
  useEffect(
    () => pruneDownloadSelection(stations),
    [stations, pruneDownloadSelection],
  );
  const selectedIds = useMemo(
    () => downloadStations.map(({ id }) => id),
    [downloadStations],
  );
  const tableStations = useMemo(
    () =>
      selectedOnly
        ? stations.filter(({ id }) => selectedIds.includes(id))
        : stations,
    [stations, selectedOnly, selectedIds],
  );
  const [helpVisible, setHelpVisible] = useState(false);
  const [compact, setCompact] = useState(false);
  const [isPending, startTransition] = useTransition();
  const handleChangeCompact = (v) => startTransition(() => setCompact(v));
  const handleHelpButtonClick = () => setHelpVisible(!helpVisible);

  const columnInfo = useMemo(
    () => smtColumnInfo({ allNetworks, allVariables, compact }),
    [allNetworks, allVariables, compact],
  );

  const data = useMemo(() => smtData(stations, compact), [stations, compact]);

  const tableData = useMemo(
    () => smtData(tableStations, compact),
    [tableStations, compact],
  );
  const tableColumns = useMemo(
    () => [
      {
        id: "station-actions",
        Header: "Actions",
        doFilter: false,
        Cell: ({ row }) => {
          const station = compact ? row.original : row.original.station;
          const name = stationDisplayName(station);
          return (
            <div className="station-row-actions">
              <label className="station-row-select">
                <input
                  type="checkbox"
                  aria-label={`Select ${name}`}
                  checked={selectedIds.includes(station.id)}
                  onChange={(event) =>
                    setStationDownloadSelected(station, event.target.checked)
                  }
                />
              </label>
              <DownloadStationData
                stations={[station]}
                title={`Download ${name}`}
              >
                <Download aria-hidden="true" />
              </DownloadStationData>
            </div>
          );
        },
      },
      ...columnInfo.columns,
    ],
    [columnInfo, compact, selectedIds, setStationDownloadSelected],
  );

  // Note: Download button is rendered here because it uses `columnInfo` to
  // control what it does. We consider it an adjunct to the table.
  return (
    <>
      <Row className={rowClasses}>
        <SelectionCounts />
      </Row>
      <div className={"StationMetadata"}>
        <ButtonToolbar className="justify-content-between">
          {/* Table help show/hide button */}
          <ButtonToolbar>
            <ButtonGroup className={"me-3"}>
              <Button
                onClick={handleHelpButtonClick}
                size="sm"
                variant="outline-secondary"
              >
                {helpVisible ? "Hide" : "Show"} Help
              </Button>
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
              {[false, true].map((value) => (
                <ToggleButton
                  id={`stn-md-compact-${value.toString()}`}
                  key={value.toString()}
                  size={"sm"}
                  variant={"outline-success"}
                  value={value}
                >
                  By {value ? "Station" : "History"}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <ButtonGroup className={"me-3"}>
              <InfoPopup title={"Table Data Organization"}>
                <p>
                  Station metadata can be displayed (and downloaded) in two
                  formats, by history and by station.
                </p>
                <p>
                  The by-history format presents one history per table row,
                  repeating station information in each row as necessary. It is
                  a less compact and readable format, but more easily
                  mechanically processed, and it breaks out values such as
                  latitude and longitude into separate columns.
                </p>
                <p>
                  The by-station format presents one station per table row, and
                  rolls up information from all histories for a station into a
                  more compact and readable form. It is however less easily
                  mechanically processed, and combines related values such as
                  latitude and longitude into single columns.
                </p>
              </InfoPopup>
            </ButtonGroup>
          </ButtonToolbar>

          <ButtonToolbar className="align-items-center gap-2">
            <DownloadStationData
              stations={downloadStations}
              variant="outline-success"
              ariaLabel={`Download selected stations (${selectedIds.length})`}
            >
              <Download aria-hidden="true" /> Selected ({selectedIds.length})
            </DownloadStationData>
            <Button
              size="sm"
              variant="outline-secondary"
              disabled={!selectedIds.length}
              onClick={clearDownloadSelection}
            >
              Clear selection
            </Button>
            <Form.Check
              id="metadata-selected-only"
              label="Selected only"
              checked={selectedOnly}
              onChange={(event) => setSelectedOnly(event.target.checked)}
            />
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
              <InfoPopup placement="left" title={"Download Metadata"}>
                Download the metadata presented in the table below (all rows,
                not just those visible) as a CSV file. The downloaded file
                includes extra columns not visible in the table.
              </InfoPopup>
            </ButtonGroup>
          </ButtonToolbar>
        </ButtonToolbar>

        {helpVisible && (
          <Card body className="mt-3 mb-3">
            <h1>Station metadata table</h1>
            <p>
              This table allows you to explore station metadata dynamically.
            </p>
            <p>
              The controls in this table affect only the <em>display</em> of
              metadata of the stations selected by the{" "}
              <strong>Station Filters</strong> tab and the map. They affect
              neither the stations selected on the map, nor the metadata that is
              downloaded by the <strong>Download Metadata</strong> button on
              this tab, nor the data downloaded by the{" "}
              <strong>Download Timeseries/Climatology</strong> buttons on the{" "}
              <strong>Station Data</strong> tab.
            </p>
            <p>
              Select station checkboxes in the table or map summary, then use
              the Selected download button for one ZIP. The download icon opens
              options for a single station. Changing filters clears the download
              selection. Selected only limits the table display; metadata CSV
              still includes all stations matching the station criteria and map
              polygon.
            </p>
            <h1>Filter controls</h1>
            <p>
              Filter controls are located just below each column label. A filter
              allows through only those rows whose column matches what you
              select or enter in them. The count of rows that pass all the
              filters is shown at the top of the table header, above the column
              labels and the filter controls. Examples:
              <ul>
                <li>
                  The Network Name column filter allows you to select all or
                  just one of the networks selected by the{" "}
                  <strong>Networks</strong> control in the{" "}
                  <strong>Station Filters</strong> tab.
                </li>
                <li>
                  To find a station or stations whose name partially matches a
                  given string, enter that string in the Station Name column
                  filter.
                </li>
                <li>
                  You can use any number of the column filters, and the rows
                  visible are only those that match all the filters.
                </li>
              </ul>
            </p>
            <h1>Managing overflow</h1>
            <p>
              Because the table contains a lot of information, it can overflow
              horizontally and run far down the page vertically.
              <ul>
                <li>
                  Use the column width buttons just below the header to give
                  more space for the table and less space for the map. This can
                  make it far easier to use the table.
                </li>
                <li>
                  If table content is overflowing horizontally, scroll down to
                  the bottom of the page to use the table's horizontal scroll
                  bar.
                </li>
              </ul>
            </p>
            <h1>Other help</h1>
            <p>
              See the <InfoPopup title="Very helpful!" /> next to various items
              on this page.
            </p>
          </Card>
        )}
        {isPending ? (
          <p>Loading...</p>
        ) : (
          <FancyTable
            data={tableData}
            {...columnInfo}
            columns={tableColumns}
            onFiltersChange={clearDownloadSelection}
            size="sm"
            responsive
            striped
          />
        )}
      </div>
    </>
  );
}

StationMetadata.propTypes = {
  stations: PropTypes.array,
  metadata: PropTypes.object,
};

export default StationMetadata;
