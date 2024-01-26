/**
 * @module DateRange
 * @description DateRange component that can display ranges of data. Code originally pulled from
 * https://github.com/lizashkod/react-timeline-range-slider and customised.
 * @param {array} timelineInterval - array of two dates that represent the start and end of the timeline
 * @param {array} selectedInterval - array of two dates that represent the start and end of the selected interval
 * @param {array} disabledIntervals - array of objects that represent the start and end of the disabled intervals
 * @param {array} dataIntervals - array of objects that represent the start and end of the data intervals
 * @param {string} containerClassName - class name for the container
 * @param {string} sliderRailClassName - class name for the slider rail
 * @param {number} step - how many steps should be available when dragging the handles
 * @param {number} ticksNumber - how many ticks should be displayed along the bottom timeline
 * @param {function} formatTick - function that formats the tick label
 * @param {function} onChangeCallback - callback function that is called each time a handle is moved
 * @param {function} onUpdateCallback - callback function that is called when a handle is released
 * @param {boolean} showNow - whether to show the now indicator
 * @param {boolean} error - displays if the selected interval is invalid (overlaps with disabled intervals)
 * @param {boolean} hideHandles - whether to hide the handles
 * @param {number|function} mode - the mode of the slider, as defined by react-compound-slider
 */
import React from "react";
import PropTypes from "prop-types";
import { scaleTime } from "d3-scale";
import { Slider, Rail, Handles, Tracks, Ticks } from "react-compound-slider";
import {
  format,
  addHours,
  startOfToday,
  endOfToday,
  differenceInMilliseconds,
  isBefore,
  isAfter,
  set,
  addMinutes,
} from "date-fns";

import SliderRail from "./sub/SliderRail";
import DisabledTrack from "./sub/Track";
import DataTrack from "./sub/DataTrack";
import Tick from "./sub/Tick";
import Handle from "./sub/Handle";

import "./styles/index.scss";

const getTimelineConfig = (timelineStart, timelineLength) => (date) => {
  const percent =
    (differenceInMilliseconds(date, timelineStart) / timelineLength) * 100;
  const value = Number(format(date, "T"));
  return { percent, value };
};

const getFormattedIntervals = (
  blockedDates = [],
  [startTime, endTime],
  classPrefix = "blocked-track",
) => {
  if (!blockedDates.length) return null;

  const timelineLength = differenceInMilliseconds(endTime, startTime);
  const getConfig = getTimelineConfig(startTime, timelineLength);

  const formattedBlockedDates = blockedDates
    .sort((a, b) => a.start - b.start)
    .map((interval, index) => {
      let { start, end, type } = interval;

      if (isBefore(start, startTime)) start = startTime;
      if (isAfter(end, endTime)) end = endTime;

      const source = getConfig(start);
      const target = getConfig(end);

      return { id: `${classPrefix}-${index}`, source, target, type };
    });

  console.log("### formattedBlockedDates", formattedBlockedDates);

  return formattedBlockedDates;
};

const getNowConfig = ([startTime, endTime]) => {
  const timelineLength = differenceInMilliseconds(endTime, startTime);
  const getConfig = getTimelineConfig(startTime, timelineLength);

  const source = getConfig(new Date());
  const target = getConfig(addMinutes(new Date(), 1));

  return { id: "now-track", source, target };
};

class DateRange extends React.Component {
  get disabledIntervals() {
    return getFormattedIntervals(
      this.props.disabledIntervals,
      this.props.timelineInterval,
    );
  }

  get dataIntervals() {
    return getFormattedIntervals(
      this.props.dataIntervals,
      this.props.timelineInterval,
      "data-track",
    );
  }

  get now() {
    return getNowConfig(this.props.timelineInterval);
  }

  onChange = (newTime) => {
    const formattedNewTime = newTime.map((t) => new Date(t));
    this.props.onChangeCallback(formattedNewTime);
  };

  checkIsSelectedIntervalNotValid = ([start, end], source, target) => {
    const { value: startInterval } = source;
    const { value: endInterval } = target;

    if (
      (startInterval > start && endInterval <= end) ||
      (startInterval >= start && endInterval < end)
    )
      return true;
    if (start >= startInterval && end <= endInterval) return true;

    const isStartInBlockedInterval =
      start > startInterval && start < endInterval && end >= endInterval;
    const isEndInBlockedInterval =
      end < endInterval && end > startInterval && start <= startInterval;

    return isStartInBlockedInterval || isEndInBlockedInterval;
  };

  onUpdate = (newTime) => {
    const { onUpdateCallback } = this.props;
    const disabledIntervals = this.disabledIntervals;

    if (disabledIntervals?.length) {
      const isValuesNotValid = disabledIntervals.some(({ source, target }) =>
        this.checkIsSelectedIntervalNotValid(newTime, source, target),
      );
      const formattedNewTime = newTime.map((t) => new Date(t));
      onUpdateCallback({ error: isValuesNotValid, time: formattedNewTime });
      return;
    }

    const formattedNewTime = newTime.map((t) => new Date(t));
    onUpdateCallback({ error: false, time: formattedNewTime });
  };

  getDateTicks = () => {
    const { timelineInterval, ticksNumber } = this.props;
    return scaleTime()
      .domain(timelineInterval)
      .ticks(ticksNumber)
      .map((t) => +t);
  };

  render() {
    const {
      sliderRailClassName,
      timelineInterval,
      selectedInterval,
      containerClassName,
      error,
      step,
      showNow,
      formatTick,
      mode,
      hideHandles,
    } = this.props;

    console.log("### dataIntervals", this.props.dataIntervals);

    const domain = timelineInterval.map((t) => Number(t));

    const disabledIntervals = this.disabledIntervals;
    const dataIntervals = this.dataIntervals;

    return (
      <div
        className={
          containerClassName || "react_time_range__time_range_container"
        }
      >
        <Slider
          mode={mode}
          step={step}
          domain={domain}
          onUpdate={this.onUpdate}
          onChange={this.onChange}
          values={selectedInterval.map((t) => +t)}
          rootStyle={{ position: "relative", width: "100%" }}
        >
          <Rail>
            {({ getRailProps }) => (
              <SliderRail
                className={sliderRailClassName}
                getRailProps={getRailProps}
              />
            )}
          </Rail>

          {!hideHandles && (
            <Handles>
              {({ handles, getHandleProps }) => (
                <>
                  {handles.map((handle) => (
                    <Handle
                      error={error}
                      key={handle.id}
                      handle={handle}
                      domain={domain}
                      getHandleProps={getHandleProps}
                    />
                  ))}
                </>
              )}
            </Handles>
          )}

          <Tracks left={false} right={false}>
            {({ tracks, getTrackProps }) => (
              <>
                {tracks?.map(({ id, source, target }) => (
                  <DisabledTrack
                    error={error}
                    key={id}
                    source={source}
                    target={target}
                    getTrackProps={getTrackProps}
                  />
                ))}
              </>
            )}
          </Tracks>

          {disabledIntervals?.length && (
            <Tracks left={false} right={false}>
              {({ getTrackProps }) => (
                <>
                  {disabledIntervals.map(({ id, source, target }) => (
                    <DisabledTrack
                      key={id}
                      source={source}
                      target={target}
                      getTrackProps={getTrackProps}
                      disabled
                    />
                  ))}
                </>
              )}
            </Tracks>
          )}

          {dataIntervals?.length && (
            <Tracks left={false} right={false}>
              {({ getTrackProps }) => (
                <>
                  {dataIntervals.map(({ id, source, target, type }, index) => (
                    <DataTrack
                      key={id}
                      source={source}
                      target={target}
                      getTrackProps={getTrackProps}
                      count={dataIntervals.length}
                      index={index}
                      type={type}
                      disabled
                    />
                  ))}
                </>
              )}
            </Tracks>
          )}

          {showNow && (
            <Tracks left={false} right={false}>
              {({ getTrackProps }) => (
                <DisabledTrack
                  key={this.now?.id}
                  source={this.now?.source}
                  target={this.now?.target}
                  getTrackProps={getTrackProps}
                />
              )}
            </Tracks>
          )}

          <Ticks values={this.getDateTicks()}>
            {({ ticks }) => (
              <>
                {ticks.map((tick) => (
                  <Tick
                    key={tick.id}
                    tick={tick}
                    count={ticks.length}
                    format={formatTick}
                  />
                ))}
              </>
            )}
          </Ticks>
        </Slider>
      </div>
    );
  }
}

DateRange.propTypes = {
  ticksNumber: PropTypes.number.isRequired,
  selectedInterval: PropTypes.arrayOf(PropTypes.object),
  timelineInterval: PropTypes.arrayOf(PropTypes.object),
  disabledIntervals: PropTypes.arrayOf(PropTypes.object),
  dataIntervals: PropTypes.arrayOf(PropTypes.object),
  containerClassName: PropTypes.string,
  sliderRailClassName: PropTypes.string,
  step: PropTypes.number,
  formatTick: PropTypes.func,
  hideHandles: PropTypes.bool,
};

DateRange.defaultProps = {
  selectedInterval: [
    set(new Date(), { minutes: 0, seconds: 0, milliseconds: 0 }),
    set(addHours(new Date(), 1), { minutes: 0, seconds: 0, milliseconds: 0 }),
  ],
  timelineInterval: [startOfToday(), endOfToday()],
  formatTick: (ms) => format(new Date(ms), "HH:mm"),
  disabledIntervals: [],
  dataIntervals: [],
  step: 1000 * 60 * 30,
  ticksNumber: 48,
  error: false,
  mode: 3,
  hideHandles: false,
};

export default DateRange;
