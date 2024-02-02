import PropTypes from "prop-types";
import React from "react";
import { Tooltip } from "react-leaflet";
import { stationNetwork, uniqStationNames } from "../../../utils/station-info";
import flow from "lodash/fp/flow";
import join from "lodash/fp/join";
import "./StationTooltip.css";

function StationTooltip({ station, metadata }) {
  const network = stationNetwork(metadata.networks, station);
  const stationNames = flow(uniqStationNames, join(", "))(station);

  return (
    <Tooltip sticky>
      {stationNames} <span>({network.name})</span>
    </Tooltip>
  );
}

StationTooltip.propTypes = {
  station: PropTypes.object.isRequired,
  metadata: PropTypes.object.isRequired,
};

export default StationTooltip;
