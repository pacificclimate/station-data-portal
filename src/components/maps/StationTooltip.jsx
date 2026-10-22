import DownloadStationData from "@/components/controls/DownloadStationData";
import PropTypes from "prop-types";
import React from "react";
import { Tooltip } from "react-leaflet";
import { stationNetwork, uniqStationNames } from "../../utils/station-info";
import flow from "lodash/fp/flow";
import join from "lodash/fp/join";
import { useNetworks } from "../../state/query-hooks/use-networks";
import "./StationTooltip.css";

function StationTooltip({ station }) {
  const { data: networks } = useNetworks();
  const network = stationNetwork(networks, station);
  const stationNames = flow(uniqStationNames, join(", "))(station);

  return (
    <Tooltip sticky interactive>
      {stationNames} <span>({network.name})</span>
      <div>
        <DownloadStationData stations={[station]} />
      </div>
    </Tooltip>
  );
}

StationTooltip.propTypes = {
  station: PropTypes.object.isRequired,
};

export default StationTooltip;
