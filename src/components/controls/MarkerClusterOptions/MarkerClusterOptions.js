import PropTypes from 'prop-types';
import React from 'react';
import { useImmer } from 'use-immer';
import { Form } from 'react-bootstrap';

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
    <Form>
      <Form.Check
        label={"removeOutsideVisibleBounds"}
        checked={removeOutsideVisibleBounds}
        onChange={toggleRemoveOutsideVisibleBounds}
      />

      <Form.Check
        label={"spiderfyOnMaxZoom"}
        checked={spiderfyOnMaxZoom}
        onChange={toggleSpiderfyOnMaxZoom}
      />

      <Form.Check
        label={"zoomToBoundsOnClick"}
        checked={zoomToBoundsOnClick}
        onChange={toggleZoomToBoundsOnClick}
      />

      <Form.Label>Disable clustering at zoom level</Form.Label>
      <Form.Control
        as={"input"}
        type={"number"}
        placeholder={"Zoom level"}
        value={disableClusteringAtZoom}
        onChange={handleChangeDisableClusteringAtZoom}
      />

      <Form.Label>Max. cluster radius</Form.Label>
      <Form.Control
        as={"input"}
        type={"number"}
        placeholder={"Radius in pixels"}
        value={maxClusterRadius}
        onChange={handleChangeMaxClusterRadius}
      />

      <Form.Check
        label={"chunkedLoading"}
        checked={chunkedLoading}
        onChange={toggleChunkedLoading}
      />
    </Form>
  );
}

MarkerClusterOptions.propTypes = {
  value: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default MarkerClusterOptions;
