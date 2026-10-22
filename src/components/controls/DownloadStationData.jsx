import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { Button, Form, Modal } from "react-bootstrap";
import { useShallow } from "zustand/react/shallow";
import { useNetworks } from "@/state/query-hooks/use-networks";
import { useVariables } from "@/state/query-hooks/use-variables";
import { useFrequencies } from "@/state/query-hooks/use-frequencies";
import ObservationCounts from "@/components/info/ObservationCounts";
import FileFormatSelector from "@/components/selectors/FileFormatSelector";
import ClipToDateControl from "@/components/controls/ClipToDateControl";
import { useConfigContext } from "@/state/context-hooks/use-config-context";
import { useStationsStore } from "@/state/client/stations-store";
import { stationDisplayName } from "@/utils/station-info";
import { stationDataDownloadRequest } from "@/utils/pdp-data-service";

import "./DownloadStationData.css";

function StationDownloadOptions({ stations }) {
  const config = useConfigContext();
  const startDate = useStationsStore((state) => state.startDate);
  const endDate = useStationsStore((state) => state.endDate);
  const { data: allNetworks } = useNetworks();
  const { data: allVariables } = useVariables();
  const { data: allFrequencies } = useFrequencies();
  const selection = useStationsStore(
    useShallow((state) => ({
      selectedNetworksUris: state.selectedNetworks,
      selectedVariablesIds: state.selectedVariables,
      selectedFrequencies: state.selectedFrequencies,
      polygon: state.area,
      onlyWithClimatology: state.onlyWithClimatology,
      includeStationsWithNoObs: state.includeStationsWithNoObs,
    })),
  );
  const filtersReady = allNetworks && allVariables && allFrequencies;
  const filtersAvailable =
    filtersReady &&
    selection.selectedNetworksUris.every((uri) =>
      allNetworks.some((network) => network.uri === uri),
    ) &&
    selection.selectedVariablesIds.every((id) =>
      allVariables.some((variable) => variable.id === id),
    ) &&
    selection.selectedFrequencies.every((frequency) =>
      allFrequencies.includes(frequency),
    );
  const canDownload =
    selection.selectedNetworksUris.length > 0 &&
    (selection.includeStationsWithNoObs ||
      (selection.selectedVariablesIds.length > 0 &&
        selection.selectedFrequencies.length > 0));
  const [dataFormat, setDataFormat] = useState({
    value: "nc",
    label: "NetCDF",
  });
  const [clipToDate, setClipToDate] = useState(false);
  const uniqueStations = useMemo(
    () => [
      ...new Map(stations.map((station) => [station.id, station])).values(),
    ],
    [stations],
  );

  return (
    <>
      <ObservationCounts clipToDate={clipToDate} stations={uniqueStations} />
      <details className="mb-3">
        <summary>
          Stations included ({uniqueStations.length.toLocaleString()})
        </summary>
        <ul className="station-download-list">
          {uniqueStations.map((station) => (
            <li key={station.id}>{stationDisplayName(station)}</li>
          ))}
        </ul>
      </details>
      <p>
        Download all recorded variables for these stations as one ZIP archive.
        Enable date clipping to use the filter date range.
      </p>
      <div className="mb-3">
        <ClipToDateControl value={clipToDate} onChange={setClipToDate} />
      </div>
      <div className="mb-3">
        <FileFormatSelector value={dataFormat} onChange={setDataFormat} />
      </div>
      <div className="d-flex flex-wrap gap-2">
        {!filtersReady ? (
          <span role="status">Loading download filters...</span>
        ) : !filtersAvailable ? (
          <span role="status">
            Some selected filters are unavailable. Update your filters before
            downloading.
          </span>
        ) : !canDownload ? (
          <span role="status">No stations match the current filters.</span>
        ) : (
          ["timeseries", "climatology"].map((dataCategory) => {
            const { action, fields } = stationDataDownloadRequest({
              config,
              ...selection,
              allNetworks,
              allVariables,
              allFrequencies,
              stationIds: uniqueStations.map(({ id }) => id),
              dataCategory,
              dataFormat,
              clipToDate,
              startDate,
              endDate,
            });
            const label = `Download ${dataCategory === "timeseries" ? "Timeseries" : "Climatology"} ZIP`;
            return (
              <Form
                key={dataCategory}
                action={action}
                method="post"
                encType="application/x-www-form-urlencoded"
                target="_blank"
                rel="noopener"
                aria-label={label}
              >
                {Object.entries(fields).map(([name, value]) => (
                  <input key={name} type="hidden" name={name} value={value} />
                ))}
                <Button size="sm" type="submit">
                  {label}
                </Button>
              </Form>
            );
          })
        )}
      </div>
      <p className="text-muted small mt-2 mb-0">
        The server prepares the ZIP. Your browser manages the download; any
        server error opens in a separate tab.
      </p>
    </>
  );
}

// Mount the download controls only while open, including for map tooltips.
export default function DownloadStationData({
  stations,
  title,
  variant = "link",
  ariaLabel,
  children = "Download station data",
}) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!stations.length) setShow(false);
  }, [stations.length]);
  return (
    <>
      <Button
        variant={variant}
        size="sm"
        className={`station-download-trigger ${variant !== "link" ? "station-download-button station-table-download" : title ? "station-row-action" : "p-0"}`}
        disabled={!stations.length}
        title={title}
        aria-label={ariaLabel ?? title}
        onClick={(event) => {
          event.stopPropagation();
          setShow(true);
        }}
      >
        {children}
      </Button>
      {show && stations.length > 0 && (
        <Modal
          show
          onHide={() => setShow(false)}
          aria-labelledby="station-download-title"
        >
          <Modal.Header closeButton>
            <Modal.Title id="station-download-title">
              Download station data
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <StationDownloadOptions stations={stations} />
          </Modal.Body>
        </Modal>
      )}
    </>
  );
}

DownloadStationData.propTypes = {
  stations: PropTypes.arrayOf(PropTypes.object).isRequired,
  title: PropTypes.string,
  variant: PropTypes.string,
  ariaLabel: PropTypes.string,
  children: PropTypes.node,
};
