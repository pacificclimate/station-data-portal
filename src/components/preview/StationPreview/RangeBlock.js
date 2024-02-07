import React, { useState, useEffect } from "react";
import DateRange from "../../daterange";
import startOfMonth from "date-fns/startOfMonth";
import endOfMonth from "date-fns/endOfMonth";
import addDays from "date-fns/addDays";
import differenceInDays from "date-fns/differenceInDays";
import differenceInYears from "date-fns/differenceInYears";
import startOfDecade from "date-fns/startOfDecade";
import endOfDecade from "date-fns/endOfDecade";
import { useStore } from "../../../state/state-store";

const millisecondsPerMonth = 2629746000;
const millisedondsPerDay = 86400000;

const RangeBlock = ({}) => {
  const {
    minStartDate,
    maxEndDate,
    selectedStartDate,
    selectedEndDate,
    setSelectedStartDate,
    setSelectedEndDate,
    previewStationVariables,
  } = useStore((state) => ({
    minStartDate: state.minStartDate,
    maxEndDate: state.maxEndDate,
    selectedStartDate: state.selectedStartDate,
    selectedEndDate: state.selectedEndDate,
    setSelectedStartDate: state.setSelectedStartDate,
    setSelectedEndDate: state.setSelectedEndDate,
    previewStationVariables: state.previewStationVariables,
  }));

  const startTime = startOfDecade(minStartDate);
  const endTime = addDays(endOfDecade(maxEndDate), 1);

  // console.log("### start", startTime);
  // console.log("### end", endTime);

  const selectedInterval = [selectedStartDate, selectedEndDate];

  const error = null;
  const ticks = differenceInYears(endTime, startTime) / 10 + 1;
  //console.log("### ticks", ticks);

  const onTimeRangeChange = (range) => {
    const [start, end] = range;

    console.log(
      "### onTimeRangeChange",
      start,
      end,
      selectedStartDate,
      selectedEndDate,
    );
    console.log(
      "### diff",
      differenceInDays(start, selectedStartDate),
      differenceInDays(end, selectedEndDate),
    );

    // the range control will try to adjust its range to be aligned with its "step" value.
    // rejecting small adjustments made by the control prevent us getting into a loop of constant adjustments
    // if changing the step value, this may need to be adjusted to reject a larger range
    if (Math.abs(differenceInDays(start, selectedStartDate)) > 1) {
      setSelectedStartDate(start);
    } else if (Math.abs(differenceInDays(end, selectedEndDate)) > 1) {
      setSelectedEndDate(end);
    }
  };

  // const onMode = (curr, next, step, reversed, getValue) => {
  //   console.log("### mode", curr, next);
  //   return curr;
  // };

  return (
    <DateRange
      error={error}
      ticksNumber={ticks}
      selectedInterval={selectedInterval}
      timelineInterval={[startTime, endTime]}
      formatTick={(t) => new Date(t).getFullYear()}
      step={millisedondsPerDay}
      onUpdateCallback={() => {}}
      onChangeCallback={onTimeRangeChange}
      //mode={onMode}
      dataIntervals={previewStationVariables.map((data) => ({
        start: new Date(data.min_obs_time),
        end: new Date(data.max_obs_time),
        type: "observation",
      }))}
      //hideHandles={true}
    />
  );
};

export default RangeBlock;
