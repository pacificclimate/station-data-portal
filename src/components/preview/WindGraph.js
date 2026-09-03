import React from "react";
import { Spinner } from "react-bootstrap";
import map from "lodash/fp/map";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "@/state/client/state-store";
import { useStationVariableObservations } from "@/state/query-hooks/use-station-variable-observations";
import { useConfigContext } from "@/state/context-hooks/use-config-context";

import Plotly from "plotly.js-basic-dist";
import createPlotlyComponent from "react-plotly.js/factory";

const Plot = createPlotlyComponent(Plotly);

const getCompassDirection = (degrees) => {
  if (
    degrees === null ||
    degrees === undefined ||
    Number.isNaN(Number(degrees))
  ) {
    return "";
  }

  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const normalizedDegrees = ((Number(degrees) % 360) + 360) % 360;
  const index = Math.round(normalizedDegrees / 45) % 8;

  return directions[index];
};

const findClosestObservation = (time, observations) => {
  if (!observations.length) {
    return null;
  }

  const targetTime = new Date(time).getTime();

  let closest = null;
  let closestDifference = Infinity;

  for (const observation of observations) {
    const observationTime = new Date(observation.time).getTime();
    const difference = Math.abs(observationTime - targetTime);

    if (difference < closestDifference) {
      closest = observation;
      closestDifference = difference;
    }
  }

  return closest;
};

const WindGraph = ({ speedVariableId, directionVariableId }) => {
  const { stationId, selectedStartDate, selectedEndDate, showLegend } =
    useStore(
      useShallow((state) => ({
        stationId: state.stationId,
        selectedStartDate: state.selectedStartDate,
        selectedEndDate: state.selectedEndDate,
        showLegend: state.showLegend,
      })),
    );

  const config = useConfigContext();

  const {
    data: speedObservations,
    isLoading: isSpeedLoading,
    isError: isSpeedError,
  } = useStationVariableObservations(
    stationId,
    speedVariableId,
    selectedStartDate,
    selectedEndDate,
  );

  const {
    data: directionObservations,
    isLoading: isDirectionLoading,
    isError: isDirectionError,
  } = useStationVariableObservations(
    stationId,
    directionVariableId,
    selectedStartDate,
    selectedEndDate,
  );

  if (isSpeedLoading || isDirectionLoading) {
    return (
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    );
  }

  if (isSpeedError || isDirectionError) {
    return <div>Error loading wind observation data.</div>;
  }

  const speedData = speedObservations?.observations ?? [];
  const directionData = directionObservations?.observations ?? [];

  if (speedData.length === 0 && directionData.length === 0) {
    return <div>No wind data found in the currently selected time period.</div>;
  }

  const speedUnit = speedObservations?.variable?.unit ?? "";

  const speedCustomData = speedData.map((speedObservation) => {
    const directionObservation = findClosestObservation(
      speedObservation.time,
      directionData,
    );

    if (!directionObservation) {
      return [null, ""];
    }

    const direction = Number(directionObservation.value);

    return [direction, getCompassDirection(direction)];
  });

  const directionCustomData = directionData.map((directionObservation) => {
    const speedObservation = findClosestObservation(
      directionObservation.time,
      speedData,
    );

    return [
      speedObservation ? Number(speedObservation.value) : null,
      getCompassDirection(Number(directionObservation.value)),
    ];
  });

  return (
    <Plot
      style={{ width: "100%", height: "500px" }}
      data={[
        {
          x: map("time", speedData),
          y: map("value", speedData),
          customdata: speedCustomData,
          type: "scatter",
          mode: "lines",
          name: "Wind speed",
          yaxis: "y",
          line: {
            color: config.plotColor,
          },
          hovertemplate:
            "%{x}<br>" +
            `<b>Wind speed:</b> %{y:.1f} ${speedUnit}` +
            "<br>" +
            "<b>Wind direction:</b> %{customdata[0]:.0f}° " +
            "(%{customdata[1]})" +
            "<extra></extra>",
        },
        {
          x: map("time", directionData),
          y: map("value", directionData),
          customdata: directionCustomData,
          type: "scatter",
          mode: "markers",
          name: "Wind direction",
          yaxis: "y2",
          marker: {
            color: config.plotColor,
            size: 4,
            opacity: 0.7,
          },
          hovertemplate:
            "%{x}<br>" +
            `<b>Wind speed:</b> %{customdata[0]:.1f} ${speedUnit}` +
            "<br>" +
            "<b>Wind direction:</b> %{y:.0f}° " +
            "(%{customdata[1]})" +
            "<extra></extra>",
        },
      ]}
      layout={{
        margin: {
          t: !showLegend ? 50 : 30,
          l: 60,
          r: 50,
          b: 50,
        },
        autosize: true,
        title: showLegend ? null : "Wind speed and direction",
        xaxis: {
          title: "Time",
          type: "date",
          autorange: false,
          range: [selectedStartDate, selectedEndDate],
          anchor: "y2",
        },
        yaxis: {
          title: speedUnit || "Wind speed",
          domain: [0.32, 1],
          rangemode: "tozero",
        },
        yaxis2: {
          title: "Direction",
          domain: [0, 0.22],
          range: [0, 360],
          tickmode: "array",
          tickvals: [0, 45, 90, 135, 180, 225, 270, 315],
          ticktext: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"],
        },
        showlegend: true,
        legend: {
          orientation: "h",
          x: 0,
          y: 1.08,
        },
        hovermode: "closest",
      }}
      useResizeHandler={true}
    />
  );
};

export default WindGraph;
