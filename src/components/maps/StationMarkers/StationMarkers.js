import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { CircleMarker, Polygon } from 'react-leaflet';
import map from 'lodash/fp/map';
import flow from 'lodash/fp/flow';

import StationTooltip from '../StationTooltip';
import StationPopup from '../StationPopup';

import logger from '../../../logger';

import './StationMarkers.css';
import {
  stationNetwork,
  uniqStationLocations
} from '../../../utils/station-info';
import chroma from 'chroma-js';
import { getTimer } from '../../../utils/timing';


logger.configure({ active: true });
const timer = getTimer("StationMarker timing");


const noStations = [];


const StationMarker = timer.timeThis("StationMarker")(({
  station, allNetworks, allVariables, markerOptions, polygonOptions,
}) => {
  // TODO: Construct and use popup (and possibly tooltip) lazily
  // const stationTooltip = (
  //   <StationTooltip
  //     station={station}
  //     allNetworks={allNetworks}
  //   />
  // );

  const [popup, setPopup] = useState(null);
  const popupRef = useRef();
  const popupInWaiting = (
    <StationPopup
      station={station}
      allNetworks={allNetworks}
      allVariables={allVariables}
      ref={popupRef}
    />
  );

  const addPopup = () => {
    if (popup === null) {
      console.log("Adding popup")
      setPopup(popupInWaiting);
    }
  };

  useEffect(() => {
    console.log("popup effect", popupRef)
    const _ = popupRef?.current?.leafletElement.openPopup();
  }, [popup]);

  const network = stationNetwork(allNetworks, station);
  const polygonColor =
    chroma(network?.color ?? polygonOptions.color).alpha(0.3).css();

  const uniqLatLngs = flow(
    uniqStationLocations,
    map(hx => ({ id: hx.id, lng: hx.lon, lat: hx.lat }))
  )(station);

  const r = (
    <React.Fragment>
      {
        map(
          latLng => (
            <CircleMarker
              key={latLng.id}
              center={latLng}
              {...markerOptions}
              color={network?.color}
              onClick={addPopup}
            >
              {/*{stationTooltip}*/}
              {popup}
            </CircleMarker>
          ),
          uniqLatLngs
        )
      }
      {
        uniqLatLngs.length > 1 && (
          <Polygon
            {...polygonOptions}
            color={polygonColor}
            positions={uniqLatLngs}
          >
            {/*{stationTooltip}*/}
            {popup}
          </Polygon>
        )
      }
    </React.Fragment>
  );
  return r;
});

const commonStationMarkerPropTypes = {
  allNetworks: PropTypes.array.isRequired,
  allVariables: PropTypes.array.isRequired,
  markerOptions: PropTypes.object,
  polygonOptions: PropTypes.object,
};

StationMarker.propTypes = {
  station: PropTypes.object.isRequired,
  ...commonStationMarkerPropTypes,
};

StationMarker.defaultProps = {
  markerOptions: {
    radius: 4,
    weight: 1,
    fillOpacity: 0.75,
    color: '#000000',
  },
  polygonOptions: {
    color: "green",
  },
};


const StationMarkers = ({
  stations, ...rest
}) => {
  const r = (
    map(
      station => (
        <StationMarker station={station} {...rest}/>
      ),
      stations || noStations
    )
  );
  return r;
}

StationMarkers.propTypes = {
  stations: PropTypes.array.isRequired,
  ...commonStationMarkerPropTypes,
};

StationMarkers.defaultProps = StationMarker.defaultProps;

export default StationMarkers;
