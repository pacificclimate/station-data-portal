import PropTypes from "prop-types";
import React from "react";
import { Table } from "react-bootstrap";
import { Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import isNull from "lodash/fp/isNull";
import flow from "lodash/fp/flow";
import map from "lodash/fp/map";
import join from "lodash/fp/join";
import chroma from "chroma-js";
import { valueToLabel as frequencyValueToLabel } from "@/components/selectors/FrequencySelector";

import logger from "@/logger";
import {
  stationNetwork,
  uniqStationFreqs,
  uniqStationLocations,
  uniqStationNames,
  uniqStationObsPeriods,
  uniqStationVariableNames,
} from "@/utils/station-info";
import { useNetworks } from "@/state/query-hooks/use-networks";
import { useVariables } from "@/state/query-hooks/use-variables";
import useConfigContext from "@/state/context-hooks/use-config-context";

import "./StationPopup.css";

logger.configure({ active: true });

const formatDate = (d) => (d ? d.toISOString().substr(0, 10) : "unknown");

function StationPopup({ station }) {
  const config = useConfigContext();
  const { data: networks } = useNetworks();
  const { data: variables } = useVariables();

  const network = stationNetwork(networks, station);
  const networkColor = chroma(network.color ?? config.defaultNetworkColor)
    .alpha(0.5)
    .css();

  const stationNames = flow(uniqStationNames, join(", "))(station);

  const locKey = (loc) => `${loc.lat}-${loc.lon}-${loc.elevation}`;
  const periodKey = (hx) => `${hx.min_obs_time}-${hx.max_obs_time}`;

  const stationLocations = (
    <ul className={"compact scroll-y"}>
      {flow(
        uniqStationLocations,
        map((loc) => (
          <li key={locKey(loc)}>
            {-loc.lon} W <br />
            {loc.lat} N <br />
            Elev. {loc.elevation} m
          </li>
        )),
      )(station)}
    </ul>
  );

  const usops = uniqStationObsPeriods(station);
  const stationObsPeriods =
    usops.length === 1 &&
    isNull(usops[0].min_obs_time) &&
    isNull(usops[0].max_obs_time) ? (
      <em>No observations</em>
    ) : (
      <ul className={"compact scroll-y"}>
        {map(
          (hx) => (
            <li key={periodKey(hx)}>
              {formatDate(hx.min_obs_time)}
              {" to "}
              {formatDate(hx.max_obs_time)}
            </li>
          ),
          usops,
        )}
      </ul>
    );

  const stationObsFreqs = (
    <ul className={"compact"}>
      {flow(
        uniqStationFreqs,
        map((freq) => <li key={freq}>{frequencyValueToLabel(freq)}</li>),
      )(station)}
    </ul>
  );

  const usvns = uniqStationVariableNames(variables, station);
  const variableNames =
    usvns.length === 0 ? (
      <em>No observations</em>
    ) : (
      <ul className={"compact"}>
        {map(
          (name) => (
            <li key={name}>{name}</li>
          ),
          usvns,
        )}
      </ul>
    );

  return (
    <Popup>
      <h1>Station: {stationNames}</h1>
      <Table size={"sm"} condensed="true">
        <tbody>
          <tr>
            <td>Network</td>
            <td>
              <span style={{ backgroundColor: networkColor }}>
                {`${network.name}`}
              </span>
            </td>
          </tr>
          <tr>
            <td>Native ID</td>
            <td>{station.native_id}</td>
          </tr>
          <tr>
            <td>Database ID</td>
            <td>{station.id}</td>
          </tr>
          <tr>
            <td>History count</td>
            <td>{station.histories.length}</td>
          </tr>
          <tr>
            <td>Locations</td>
            <td>{stationLocations}</td>
          </tr>
          <tr>
            <td>Record spans</td>
            <td>{stationObsPeriods}</td>
          </tr>
          <tr>
            <td>Observation freqs</td>
            <td>{stationObsFreqs}</td>
          </tr>
          <tr>
            <td>Recorded variables</td>
            <td>{variableNames}</td>
          </tr>
          <tr>
            <td>Preview</td>
            <td>
              <Link to={`preview/${station.id}`}>Preview variables</Link>
            </td>
          </tr>
        </tbody>
      </Table>
    </Popup>
  );
}

StationPopup.propTypes = {
  station: PropTypes.object.isRequired,
};

export default StationPopup;
