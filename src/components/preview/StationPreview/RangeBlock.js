import React, { useState } from "react";
import { Row, Col } from "react-bootstrap";
import DateRange from "../../daterange";
import startOfMonth from "date-fns/startOfMonth";
import endOfMonth from "date-fns/endOfMonth";
import addDays from "date-fns/addDays";
import differenceInYears from "date-fns/differenceInYears";
import startOfDecade from "date-fns/startOfDecade";
import endOfDecade from "date-fns/endOfDecade";

const millisecondsPerMonth = 2629746000;
const dataIntervals = [
  {
    min: "1969-08-01 00:00:00.000000",
    max: "1977-04-30 00:00:00.000000",
    vars_id: 428,
    display_name: "Temperature (Max.)",
    type: "observation",
  },
  {
    min: "1969-08-01 00:00:00.000000",
    max: "1977-04-30 00:00:00.000000",
    vars_id: 431,
    display_name: "Snowfall Amount",
    type: "observation",
  },
  {
    min: "2000-01-31 23:59:59.000000",
    max: "2000-12-31 23:59:59.000000",
    vars_id: 557,
    display_name: "Temperature Climatology (Min.)",
    type: "climatology",
  },
  {
    min: "2000-01-31 23:59:59.000000",
    max: "2000-12-31 23:59:59.000000",
    vars_id: 559,
    display_name: "Precipitation Climatology",
    type: "climatology",
  },
  {
    min: "1969-08-01 00:00:00.000000",
    max: "1977-04-30 00:00:00.000000",
    vars_id: 430,
    display_name: "Rainfall Amount",
    type: "observation",
  },
  {
    min: "2000-01-31 23:59:59.000000",
    max: "2000-12-31 23:59:59.000000",
    vars_id: 556,
    display_name: "Temperature Climatology (Max.)",
    type: "climatology",
  },
  {
    min: "2000-01-31 23:59:59.000000",
    max: "2000-12-31 23:59:59.000000",
    vars_id: 558,
    display_name: "Temperature Climatology (Mean)",
    type: "climatology",
  },
  {
    min: "1969-08-01 00:00:00.000000",
    max: "1977-04-30 00:00:00.000000",
    vars_id: 427,
    display_name: "Temperature (Min.)",
    type: "observation",
  },
  {
    min: "1969-08-01 00:00:00.000000",
    max: "1977-04-30 00:00:00.000000",
    vars_id: 429,
    display_name: "Precipitation Amount",
    type: "observation",
  },
];

const RangeBlock = ({}) => {
  const startTime = startOfDecade(new Date("1969-08-01 00:00:00.000000"));
  const endTime = addDays(
    endOfDecade(new Date("2000-12-31 23:59:59.000000")),
    1,
  );

  let [selectedStart, setSelectedStart] = useState(
    startOfMonth(new Date("1976-10-30T00:00:00Z")),
  );
  let [selectedEnd, setSelectedEnd] = useState(
    endOfMonth(new Date("1977-04-30T00:00:00Z")),
  );

  console.log("### start", startTime);
  console.log("### end", endTime);

  const selectedInterval = [selectedStart, selectedEnd];

  const error = null;
  const ticks = differenceInYears(endTime, startTime) / 10 + 1;
  console.log("### ticks", ticks);

  const onTimeRangeChange = (range) => {
    console.log("### onTimeRangeChange", range);
  };

  const onTimeRangeUpdate = (range) => {
    console.log("### onTimeRangeUpdate", range, selectedStart, selectedEnd);
  };

  const onMode = (curr, next, step, reversed, getValue) => {
    console.log("### mode", curr, next);
    return curr;
  };

  return (
    <>
      <Row>
        <DateRange
          error={error}
          ticksNumber={ticks}
          selectedInterval={selectedInterval}
          timelineInterval={[startTime, endTime]}
          formatTick={(t) => new Date(t).getFullYear()}
          step={millisecondsPerMonth}
          onUpdateCallback={onTimeRangeUpdate}
          onChangeCallback={onTimeRangeChange}
          mode={onMode}
          dataIntervals={dataIntervals.map((data) => ({
            start: new Date(data.min),
            end: new Date(data.max),
            type: data.type,
          }))}
          hideHandles={true}
        />
      </Row>
    </>
  );
};

export default RangeBlock;
