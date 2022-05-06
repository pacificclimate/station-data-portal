import PropTypes from 'prop-types';
import React from 'react';

import './MarkerClusterOptions.css';
import {
  Checkbox,
  ControlLabel,
  FormControl,
  FormGroup
} from 'react-bootstrap';

const makeImmerToggleBoolProp = (immerSet, prop) =>
  () => immerSet(draft => {
    draft[prop] = !draft[prop];
  });

const makeImmerSetPropFromEvent = (immerSet, prop) =>
  e => immerSet(draft => {
    draft[prop] = e.target.value;
  });

function MarkerClusterOptions({
  value,    // an immer value
  onChange, // a use-immer setter
}) {
  const toggleRemoveOutsideVisibleBounds = makeImmerToggleBoolProp(
    onChange, "removeOutsideVisibleBounds"
  );
  const toggleSpiderfyOnMaxZoom = makeImmerToggleBoolProp(
    onChange, "spiderfyOnMaxZoom"
  );
  const toggleZoomToBoundsOnClick = makeImmerToggleBoolProp(
    onChange, "zoomToBoundsOnClick"
  );
  const toggleChunkedLoading = makeImmerToggleBoolProp(
    onChange, "chunkedLoading"
  );
  const handleChangeDisableClusteringAtZoom = makeImmerSetPropFromEvent(
    onChange, "disableClusteringAtZoom"
  );
  const handleChangeMaxClusterRadius = makeImmerSetPropFromEvent(
    onChange, "maxClusterRadius"
  );

  return (
    <FormGroup>
      <Checkbox
        checked={value.removeOutsideVisibleBounds}
        onChange={toggleRemoveOutsideVisibleBounds}
      >
        removeOutsideVisibleBounds
      </Checkbox>

      <Checkbox
        checked={value.spiderfyOnMaxZoom}
        onChange={toggleSpiderfyOnMaxZoom}
      >
        spiderfyOnMaxZoom
      </Checkbox>

      <Checkbox
        checked={value.zoomToBoundsOnClick}
        onChange={toggleZoomToBoundsOnClick}
      >
        zoomToBoundsOnClick
      </Checkbox>

      <ControlLabel>Disable clustering at zoom level</ControlLabel>
      <FormControl
        componentClass={"input"}
        placeholder={"Zoom level"}
        type={"number"}
        value={value.disableClusteringAtZoom}
        onChange={handleChangeDisableClusteringAtZoom}
      />

      <ControlLabel>Max. cluster radius</ControlLabel>
      <FormControl
        componentClass={"input"}
        placeholder={"Radius in pixels"}
        type={"number"}
        value={value.maxClusterRadius}
        onChange={handleChangeMaxClusterRadius}
      />

      <Checkbox
        checked={value.chunkedLoading}
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
