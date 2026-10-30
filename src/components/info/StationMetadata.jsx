// This component renders a table showing a selected subset of station metadata.
// This component also renders a download button with which users can download
// the data in the table, plus extra hidden columns, as a CSV file.

import PropTypes from "prop-types";
import React, {
  useState,
  useMemo,
  useTransition,
  useEffect,
  useCallback,
} from "react";
import {
  Button,
  Dropdown,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  Row,
  Form,
} from "react-bootstrap";

import {
  Download,
  GeoAlt,
  Eye,
  CloudArrowDown,
  FileEarmarkSpreadsheet,
} from "react-bootstrap-icons";
import StationPreviewLink from "@/components/preview/StationPreviewLink";
import { stationDisplayName } from "@/utils/station-info";
import StationFilters from "@/components/controls/StationFilters";
import { useStationFilterSummary } from "@/state/client-server-hooks/use-station-filter-summary";
import DownloadStationData from "@/components/controls/DownloadStationData";
import { useStationsStore } from "@/state/client/stations-store";
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

function StationSelectionHeader({ rows }) {
  const compact = useStationsStore((state) => state.metadataCompact);
  const selectedStations = useStationsStore((state) => state.downloadStations);
  const select = useStationsStore((state) => state.selectStationsForDownload);
  const deselect = useStationsStore(
    (state) => state.deselectStationsForDownload,
  );
  const matching = [
    ...new Map(
      rows.map(({ original }) => {
        const station = compact ? original : original.station;
        return [station.id, station];
      }),
    ).values(),
  ];
  const selected = new Set(selectedStations.map(({ id }) => id));
  const count = matching.filter(({ id }) => selected.has(id)).length;
  const checked = matching.length > 0 && count === matching.length;
  const mixed = count > 0 && !checked;
  return (
    <label className="station-row-select">
      <input
        type="checkbox"
        aria-label="Select all matching stations"
        title="Select or deselect all matching stations across every page"
        disabled={!matching.length}
        checked={checked}
        aria-checked={mixed ? "mixed" : checked}
        ref={(input) => {
          if (input) input.indeterminate = mixed;
        }}
        onChange={(event) =>
          event.target.checked ? select(matching) : deselect(matching)
        }
      />
    </label>
  );
}

function StationMetadata({
  rowClasses,
  filterOnly = false,
  onOpenFilters,
  onCloseFilters,
  onLocateStation,
  helpVisible = false,
}) {
  const { data: allNetworks } = useNetworks();
  const { data: allVariables } = useVariables();
  const filterSummary = useStationFilterSummary();
  const {
    selectedStations: stations,
    filteredStations,
    baseFilteredStations,
    baseSelectedStations,
  } = useStationFilteringContext();
  const availableStations =
    baseSelectedStations ??
    baseFilteredStations ??
    filteredStations ??
    stations;
  const tableStations = baseSelectedStations ?? stations;
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
  const focusStation = useStationsStore((state) => state.focusStation);
  const stationsFromRows = (rows) => [
    ...new Map(
      rows.map((row) => {
        const station = compact ? row : row.station;
        return [station.id, station];
      }),
    ).values(),
  ];
  const selectedOnly = useStationsStore((state) => state.metadataSelectedOnly);
  const setSelectedOnly = useStationsStore(
    (state) => state.setMetadataSelectedOnly,
  );
  useEffect(
    () => pruneDownloadSelection(availableStations),
    [availableStations, pruneDownloadSelection],
  );
  const selectedDownloadStations = useMemo(() => {
    const available = new Set(availableStations.map(({ id }) => id));
    return downloadStations.filter(({ id }) => available.has(id));
  }, [downloadStations, availableStations]);
  const selectedIds = useMemo(
    () => selectedDownloadStations.map(({ id }) => id),
    [selectedDownloadStations],
  );

  const [downloadsOpen, setDownloadsOpen] = useState(false);
  const compact = useStationsStore((state) => state.metadataCompact);
  const setCompact = useStationsStore((state) => state.setMetadataCompact);
  const storedFilters = useStationsStore(
    (state) => state.metadataFilters[compact ? "station" : "history"],
  );
  const setMetadataFilters = useStationsStore(
    (state) => state.setMetadataFilters,
  );
  const handleFiltersChange = useCallback(
    (filters) => setMetadataFilters(compact ? "station" : "history", filters),
    [compact, setMetadataFilters],
  );
  const [isPending, startTransition] = useTransition();
  const handleChangeCompact = (v) => startTransition(() => setCompact(v));

  const columnInfo = useMemo(
    () => smtColumnInfo({ allNetworks, allVariables, compact }),
    [allNetworks, allVariables, compact],
  );

  const tableColumns = useMemo(
    () => [
      {
        id: "station-selection",
        Header: StationSelectionHeader,
        className: "station-selection-column",
        minWidth: 40,
        maxWidth: 40,
        hideFilter: true,
        Cell: ({ row }) => {
          const station = compact ? row.original : row.original.station;
          const name = stationDisplayName(station);
          return (
            <label className="station-row-select">
              <input
                type="checkbox"
                aria-label={`Select ${name}`}
                title={`Select ${name}`}
                checked={selectedIds.includes(station.id)}
                onChange={(event) =>
                  setStationDownloadSelected(station, event.target.checked)
                }
              />
            </label>
          );
        },
      },
      {
        id: "station-actions",
        Header: "Actions",
        className: "station-actions-column",
        minWidth: 112,
        maxWidth: 112,
        hideFilter: true,
        Cell: ({ row }) => {
          const station = compact ? row.original : row.original.station;
          const name = stationDisplayName(station);
          return (
            <div className="station-row-actions">
              <span
                className="station-row-action-group"
                role="group"
                aria-label={`Actions for ${name}`}
              >
                <DownloadStationData
                  scope="station"
                  stations={[station]}
                  title={`Download ${name}`}
                >
                  <Download aria-hidden="true" />
                </DownloadStationData>
                <Button
                  as={StationPreviewLink}
                  stationId={station.id}
                  variant="link"
                  size="sm"
                  className="station-row-action"
                  title={`Preview variables for ${name}`}
                  aria-label={`Preview variables for ${name}`}
                >
                  <Eye aria-hidden="true" />
                </Button>
                <Button
                  variant="link"
                  size="sm"
                  className="station-row-action"
                  title={`Locate ${name} on map`}
                  aria-label={`Locate ${name} on map`}
                  disabled={
                    !station.histories.some(
                      (history) =>
                        Number.isFinite(history.lat) &&
                        Number.isFinite(history.lon),
                    )
                  }
                  onClick={() => {
                    onLocateStation?.(station);
                    focusStation(station);
                  }}
                >
                  <GeoAlt aria-hidden="true" />
                </Button>
              </span>
            </div>
          );
        },
      },
      ...columnInfo.columns.map((column) => ({
        ...column,
        hideFilter: [
          "Network Name",
          "Variables",
          "Obs Freq",
          "Uniq Obs Freqs",
        ].includes(column.id),
      })),
    ],
    [
      columnInfo,
      compact,
      selectedIds,
      focusStation,
      setStationDownloadSelected,
      onLocateStation,
    ],
  );

  const data = useMemo(() => smtData(stations, compact), [stations, compact]);
  const tableData = useMemo(
    () =>
      smtData(
        selectedOnly && !filterOnly ? selectedDownloadStations : tableStations,
        compact,
      ),
    [
      selectedOnly,
      filterOnly,
      selectedDownloadStations,
      tableStations,
      compact,
    ],
  );

  const renderToolbar = ({ rows, filterButton }) => {
    const matching = stationsFromRows(rows);
    const count = (value) => value.toLocaleString();
    return (
      <>
        <div className="station-toolbar-group" role="group" aria-label="View">
          <span className="station-toolbar-label">View</span>
          <ToggleButtonGroup
            type="radio"
            name="compact"
            value={compact}
            onChange={handleChangeCompact}
          >
            {[false, true].map((value) => (
              <ToggleButton
                id={`stn-md-compact-${value}`}
                key={String(value)}
                size="sm"
                variant="outline-success"
                value={value}
              >
                By {value ? "Station" : "History"}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          {filterButton}
          <Form.Check
            id="metadata-selected-only"
            type="checkbox"
            label="Selected only"
            checked={selectedOnly}
            onChange={(event) => setSelectedOnly(event.target.checked)}
          />
        </div>
        <div className="station-toolbar-group" role="group" aria-label="Select">
          <span className="station-toolbar-label">Select</span>
          <Button
            size="sm"
            variant="outline-secondary"
            disabled={!selectedIds.length}
            onClick={clearDownloadSelection}
          >
            Clear selection
          </Button>
        </div>
        <div className="station-toolbar-group" role="group" aria-label="Export">
          <span className="station-toolbar-label">Export</span>
          <Dropdown show={downloadsOpen} onToggle={setDownloadsOpen}>
            <Dropdown.Toggle
              variant="success"
              size="sm"
              id="station-download-menu"
            >
              <Download aria-hidden="true" /> Download
            </Dropdown.Toggle>
            <Dropdown.Menu renderOnMount>
              <DownloadStationData
                stations={selectedDownloadStations}
                menuItem
                ariaLabel={`Download selected stations (${selectedIds.length})`}
                title="Download data for stations selected with checkboxes"
              >
                <Download aria-hidden="true" /> Selected (
                {count(selectedIds.length)})
              </DownloadStationData>
              <DownloadStationData
                stations={matching}
                menuItem
                ariaLabel={`Download all matching stations (${matching.length})`}
                title="Download all matching stations across every page"
              >
                <CloudArrowDown aria-hidden="true" /> All matching (
                {count(matching.length)})
              </DownloadStationData>
              <Dropdown.Divider />
              <Dropdown.Item
                as={DownloadMetadata}
                data={data}
                columns={columnInfo.columns}
                filename={`station-metadata-${compact ? "by-station" : "by-history"}.csv`}
                ariaLabel="Download Metadata"
                title="Download matching station metadata as CSV, including original coordinate fields"
              >
                <FileEarmarkSpreadsheet aria-hidden="true" /> Metadata (CSV)
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </>
    );
  };
  if (filterOnly)
    return (
      <FancyTable
        data={tableData}
        {...columnInfo}
        columns={tableColumns}
        filterPresentation="dialog"
        filterOnly
        filterContent={<StationFilters />}
        filterSummary={filterSummary}
        syncFilters
        initialFilters={storedFilters}
        onFiltersChange={handleFiltersChange}
        onCloseFilters={onCloseFilters}
      />
    );

  // Note: Download button is rendered here because it uses `columnInfo` to
  // control what it does. We consider it an adjunct to the table.
  return (
    <>
      <Row className={rowClasses}>
        <SelectionCounts />
      </Row>
      <div className={"StationMetadata"}>
        {helpVisible && (
          <Card body className="mb-3" id="station-table-help">
            <h3 className="h6">Explore stations</h3>
            <p>
              By History shows one history per row; By Station combines each
              station’s histories. Filters update the map and table together.
              Station criteria apply to both views; attribute filters are saved
              separately for each view.
            </p>
            <p>
              Select stations using the table or station summary checkboxes. The
              header checkbox selects matching stations across every page;
              Selected only shows your checked stations. Changing filters clears
              the download selection.
            </p>
            <p>
              Use Download for selected or all matching station data, or
              metadata as CSV. Row icons download one station, preview its
              variables, or locate it on the map and open its summary.
            </p>
            <p className="mb-0">
              Scroll within the table for additional rows and columns. Expand a
              variable cell to see its full list.
            </p>
          </Card>
        )}
        {isPending ? (
          <p>Loading...</p>
        ) : (
          <FancyTable
            key={compact ? "by-station" : "by-history"}
            data={tableData}
            {...columnInfo}
            columns={tableColumns}
            filterPresentation="dialog"
            syncFilters
            initialFilters={storedFilters}
            onFiltersChange={handleFiltersChange}
            onOpenFilters={onOpenFilters}
            filterSummary={filterSummary}
            renderToolbar={renderToolbar}
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
  rowClasses: PropTypes.string,
  filterOnly: PropTypes.bool,
  onOpenFilters: PropTypes.func,
  onCloseFilters: PropTypes.func,
  onLocateStation: PropTypes.func,
  helpVisible: PropTypes.bool,
};

export default StationMetadata;
