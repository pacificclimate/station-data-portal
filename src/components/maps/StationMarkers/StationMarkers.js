import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { CircleMarker, Polygon } from 'react-leaflet';
import map from 'lodash/fp/map';
import flow from 'lodash/fp/flow';
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


const LocationMarker = ({
  station,
  location,
  color,
  allNetworks,
  allVariables,
  markerOptions,
}) => {
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

  return (
    <CircleMarker
      key={location.id}
      center={location}
      {...markerOptions}
      color={color}
      onClick={addPopup}
    >
      {/*{stationTooltip}*/}
      {popup}
    </CircleMarker>
  );
};


const MultiLocationMarker = ({
  locations,
  color,
  polygonOptions,
}) => {
  if (locations.length <= 1) {
    return null;
  }
  return (
    <Polygon
      {...polygonOptions}
      color={color}
      positions={locations}
    >
      {/*{stationTooltip}*/}
      {/*{popup}*/}
    </Polygon>
  );
};


const StationMarkers = timer.timeThis("StationMarker")(({
  station,
  allNetworks,
  allVariables,
  markerOptions = {
    radius: 4,
    weight: 1,
    fillOpacity: 0.75,
    color: '#000000',
  },
  // TODO: Improve or remove
  polygonOptions = {
    color: "green",
  },
}) => {
  // TODO: Construct and use popup (and possibly tooltip) lazily
  // const stationTooltip = (
  //   <StationTooltip
  //     station={station}
  //     allNetworks={allNetworks}
  //   />
  // );

  const network = stationNetwork(allNetworks, station);
  const locationColor = network?.color;
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
          location => (
            <LocationMarker
              station={station}
              location={location}
              color={locationColor}
              allNetworks={allNetworks}
              allVariables={allVariables}
              markerOptions={markerOptions}
            />
          ),
          uniqLatLngs
        )
      }
      <MultiLocationMarker
        locations={uniqLatLngs}
        color={polygonColor}
        polygonOptions={polygonOptions}
      />
    </React.Fragment>
  );
  return r;
});

StationMarkers.propTypes = {
  station: PropTypes.object.isRequired,
  allNetworks: PropTypes.array.isRequired,
  allVariables: PropTypes.array.isRequired,
  markerOptions: PropTypes.object,
  polygonOptions: PropTypes.object,
};

// StationMarkers.defaultProps = {
//   markerOptions: {
//     radius: 4,
//     weight: 1,
//     fillOpacity: 0.75,
//     color: '#000000',
//   },
//   polygonOptions: {
//     color: "green",
//   },
// };


// const StationMarkers = ({
//   stations, ...rest
// }) => {
//   const r = (
//     map(
//       station => (
//         <StationMarker station={station} {...rest}/>
//       ),
//       stations || noStations
//     )
//   );
//   return r;
// }

export default StationMarkers;
