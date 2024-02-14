/**
 * @name DataTrack.js
 * @description DataTrack helps render a bar representing a range of data on the DateRange component.
 * @param
 */
import PropTypes from "prop-types";
import React from "react";

const baseHeight = 50;

/**
 * @name getTrackConfig
 * @description getTrackConfig is a function that returns the style for the track.
 * @param {Object} params
 * @param {Object} params.source the percentage offset of the start of the track
 * @param {Object} params.target the percentage offset of the end of the track
 * @param {Object} params.count the number of data tracks to be rendered
 * @param {Object} params.index the index of this data track
 * @returns {Object} basicStyle
 **/
const getTrackStyle = ({ source, target, count, index, color }) => {
  const height = baseHeight / count / 2;
  const topPosition = -22 + (baseHeight / count) * index + height / 2;
  const basicStyle = {
    top: `${topPosition}px`,
    height: `${height}px`,
    left: `${source.percent}%`,
    width: `calc(${target.percent - source.percent}% + 1px)`,
    backgroundColor: color,
  };

  return basicStyle;
};

const DataTrack = ({
  source,
  target,
  getTrackProps,
  count,
  index,
  type,
  color,
}) => (
  <div
    className={`react_time_range__data_track${type ? "__" + type : ""}`}
    style={getTrackStyle({ source, target, count, index, color })}
    {...getTrackProps()}
  />
);

DataTrack.propTypes = {
  source: PropTypes.shape({
    value: PropTypes.number.isRequired,
    percent: PropTypes.number.isRequired,
  }).isRequired,
  target: PropTypes.shape({
    value: PropTypes.number.isRequired,
    percent: PropTypes.number.isRequired,
  }).isRequired,
  getTrackProps: PropTypes.func.isRequired,
  count: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired,
  type: PropTypes.string, // used to suffix a class name to the data
};

DataTrack.defaultProps = {};

export default DataTrack;
