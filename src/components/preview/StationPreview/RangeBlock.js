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
import { useConfig } from "../../../state/query-hooks/use-config";
import { useStationVariables } from "../../../state/query-hooks/use-station-variables";

const millisecondsPerMonth = 2629746000;
const millisedondsPerDay = 86400000;

const RangeBlock = ({}) => {
  const { data: config } = useConfig();
  const storeData = useStore((state) => ({
    stationId: state.stationId,
    minStartDate: state.minStartDate,
    maxEndDate: state.maxEndDate,
    selectedStartDate: state.selectedStartDate,
    selectedEndDate: state.selectedEndDate,
  }));
  const actions = useStore((state) => ({
    setSelectedStartDate: state.setSelectedStartDate,
    setSelectedEndDate: state.setSelectedEndDate,
  }));

  const {
    data: previewStationVariables,
    isLoading,
    isError,
  } = useStationVariables(storeData.stationId);

  if (!(previewStationVariables.variables?.length ?? 0 > 0)) {
    return <div>This station has no variables associated with it.</div>;
  }

  if (isLoading || !storeData.selectedStartDate || !storeData.selectedEndDate) {
    return <div>Loading...</div>;
  }

  console.log("### RangeBlock", storeData, previewStationVariables);

  const startTime = startOfDecade(storeData.minStartDate);
  const endTime = addDays(endOfDecade(storeData.maxEndDate), 1);

  const selectedInterval = [
    storeData.selectedStartDate,
    storeData.selectedEndDate,
  ];

  const error = null;
  const ticks = differenceInYears(endTime, startTime) / 10 + 1;

  const onTimeRangeChange = ([start, end]) => {
    console.log(
      "### onTimeRangeChange",
      start,
      end,
      storeData.selectedStartDate,
      storeData.selectedEndDate,
    );
    console.log(
      "### diff",
      differenceInDays(start, storeData.selectedStartDate),
      differenceInDays(end, storeData.selectedEndDate),
    );

    // the range control will try to adjust its range to be aligned with its "step" value.
    // rejecting small adjustments made by the control prevent us getting into a loop of constant adjustments
    // if changing the step value, this may need to be adjusted to reject a larger range
    if (Math.abs(differenceInDays(start, storeData.selectedStartDate)) > 1) {
      actions.setSelectedStartDate(start);
    } else if (Math.abs(differenceInDays(end, storeData.selectedEndDate)) > 1) {
      actions.setSelectedEndDate(end);
    }
  };
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
      dataIntervals={
        previewStationVariables.variables?.map((data) => ({
          start: new Date(data.min_obs_time),
          end: new Date(data.max_obs_time),
          type: "observation",
          color: config.plotColor,
        })) ?? []
      }
      //hideHandles={true}
    />
  );
};

export default RangeBlock;
