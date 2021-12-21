import PropTypes from 'prop-types';
import React from 'react';
import { Tooltip } from 'react-leaflet'
import './StationTooltip.css';

function StationTooltip({ station, network }) {
  const histories = station.histories;
  const history0 = histories[0];
  return (
    <Tooltip>
      {history0.station_name} <span>({network.name})</span>
    </Tooltip>
  );
}

StationTooltip.propTypes = {
  station: PropTypes.object.isRequired,
  network: PropTypes.object.isRequired,
};

export default StationTooltip;
