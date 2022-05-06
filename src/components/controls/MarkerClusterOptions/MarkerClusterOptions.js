import PropTypes from 'prop-types';
import React from 'react';
import { useImmer } from 'use-immer';
import {
  Checkbox,
  ControlLabel,
  FormControl,
  FormGroup
} from 'react-bootstrap';

import './MarkerClusterOptions.css';


const makeImmerToggleBoolProp = (immerSet, prop) =>
  () => immerSet(draft => {
    draft[prop] = !draft[prop];
  });

const makeImmerSetPropFromEvent = (immerSet, prop) =>
  e => immerSet(draft => {
    draft[prop] = e.target.value;
  });

export const useMarkerClusterOptions = init => {
  const [state, setState] = useImmer(init);
  // TODO: Memoize setters?
  const setters = {
    toggleRemoveOutsideVisibleBounds:  makeImmerToggleBoolProp(
      setState, "removeOutsideVisibleBounds"
    ),
    toggleSpiderfyOnMaxZoom:  makeImmerToggleBoolProp(
      setState, "spiderfyOnMaxZoom"
    ),
    toggleZoomToBoundsOnClick:  makeImmerToggleBoolProp(
      setState, "zoomToBoundsOnClick"
    ),
    handleChangeDisableClusteringAtZoom:  makeImmerSetPropFromEvent(
      setState, "disableClusteringAtZoom"
    ),
    handleChangeMaxClusterRadius:  makeImmerSetPropFromEvent(
      setState, "maxClusterRadius"
    ),
    toggleChunkedLoading:  makeImmerToggleBoolProp(
      setState, "chunkedLoading"
    ),
  }
  return [state, setters];
}

function MarkerClusterOptions({
  value: {
    removeOutsideVisibleBounds,
    spiderfyOnMaxZoom,
    zoomToBoundsOnClick,
    disableClusteringAtZoom,
    maxClusterRadius,
    chunkedLoading,
  },    // useMarkerCluster state
  onChange: {
    toggleRemoveOutsideVisibleBounds,
    toggleSpiderfyOnMaxZoom,
    toggleZoomToBoundsOnClick,
    handleChangeDisableClusteringAtZoom,
    handleChangeMaxClusterRadius,
    toggleChunkedLoading,
  }, // useMarkerCluster setters
}) {
  return (
    <FormGroup>
      <Checkbox
        checked={removeOutsideVisibleBounds}
        onChange={toggleRemoveOutsideVisibleBounds}
      >
        removeOutsideVisibleBounds
      </Checkbox>

      <Checkbox
        checked={spiderfyOnMaxZoom}
        onChange={toggleSpiderfyOnMaxZoom}
      >
        spiderfyOnMaxZoom
      </Checkbox>

      <Checkbox
        checked={zoomToBoundsOnClick}
        onChange={toggleZoomToBoundsOnClick}
      >
        zoomToBoundsOnClick
      </Checkbox>

      <ControlLabel>Disable clustering at zoom level</ControlLabel>
      <FormControl
        componentClass={"input"}
        placeholder={"Zoom level"}
        type={"number"}
        value={disableClusteringAtZoom}
        onChange={handleChangeDisableClusteringAtZoom}
      />

      <ControlLabel>Max. cluster radius</ControlLabel>
      <FormControl
        componentClass={"input"}
        placeholder={"Radius in pixels"}
        type={"number"}
        value={maxClusterRadius}
        onChange={handleChangeMaxClusterRadius}
      />

      <Checkbox
        checked={chunkedLoading}
        onChange={toggleChunkedLoading}
      >
        chunkedLoading
      </Checkbox>
    </FormGroup>
  );
}

MarkerClusterOptions.propTypes = {
  value: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default MarkerClusterOptions;
