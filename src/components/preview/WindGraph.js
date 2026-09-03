import React from "react";
import { Spinner } from "react-bootstrap";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "@/state/client/state-store";
import { useStationVariableObservations } from "@/state/query-hooks/use-station-variable-observations";

import Plotly from "plotly.js/lib/core";
import barpolar from "plotly.js/lib/barpolar";
import createPlotlyComponent from "react-plotly.js/factory";

Plotly.register([barpolar]);

const Plot = createPlotlyComponent(Plotly);

const cardinalDirections = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
const windRoseColors = [
  "#dbe9f6",
  "#b3d2e8",
  "#82b7d8",
  "#5599c8",
  "#2d78b3",
  "#0b4f8a",
];

const getCompassDirection = (degrees) => {
  if (
    degrees === null ||
    degrees === undefined ||
    Number.isNaN(Number(degrees))
  ) {
    return "";
  }

  const normalizedDegrees = ((Number(degrees) % 360) + 360) % 360;
  const index = Math.round(normalizedDegrees / 45) % 8;

  return cardinalDirections[index];
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

const buildWindRoseData = (speedObservations, directionObservations) => {
  const pairedObservations = speedObservations.flatMap((speedObservation) => {
    const directionObservation = findClosestObservation(
      speedObservation.time,
      directionObservations,
    );
    const speed = Number(speedObservation.value);
    const direction = Number(directionObservation?.value);

    if (Number.isFinite(speed) && Number.isFinite(direction)) {
      return [{ speed, direction: getCompassDirection(direction) }];
    }

    return [];
  });

  if (!pairedObservations.length) {
    return { bins: [], observationCount: 0 };
  }

  const maximumSpeed = Math.max(
    ...pairedObservations.map((observation) => observation.speed),
  );
  const binSize = maximumSpeed / windRoseColors.length || 1;

  const bins = windRoseColors.map((color, index) => {
    const minimum = index * binSize;
    const maximum = (index + 1) * binSize;
    const counts = Object.fromEntries(
      cardinalDirections.map((direction) => [direction, 0]),
    );

    return {
      color,
      minimum,
      maximum,
      counts,
    };
  });

  pairedObservations.forEach((observation) => {
    const binIndex = Math.min(
      Math.max(Math.floor(observation.speed / binSize), 0),
      bins.length - 1,
    );
    bins[binIndex].counts[observation.direction] += 1;
  });

  return { bins, observationCount: pairedObservations.length };
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

  const { bins: windRoseData, observationCount } = buildWindRoseData(
    speedData,
    directionData,
  );

  if (!windRoseData.length) {
    return (
      <div>
        No paired wind data found in the currently selected time period.
      </div>
    );
  }

  return (
    <Plot
      style={{ width: "100%", height: "500px" }}
      data={[
        ...windRoseData.map((bin) => ({
          type: "barpolar",
          r: cardinalDirections.map(
            (direction) => (bin.counts[direction] / observationCount) * 100,
          ),
          theta: cardinalDirections,
          name: `${bin.minimum.toFixed(1)}–${bin.maximum.toFixed(1)} ${speedUnit}`,
          marker: { color: bin.color },
          hovertemplate:
            "<b>%{theta}</b><br>" +
            `Speed: ${bin.minimum.toFixed(1)}–${bin.maximum.toFixed(1)} ${speedUnit}<br>` +
            "Frequency: %{r:.1f}%" +
            "<extra></extra>",
        })),
      ]}
      layout={{
        margin: {
          t: !showLegend ? 50 : 30,
          l: 40,
          r: 80,
          b: 40,
        },
        autosize: true,
        title: showLegend ? null : "Wind rose",
        polar: {
          barmode: "stack",
          bargap: 0.1,
          angularaxis: {
            direction: "clockwise",
            rotation: 90,
          },
          radialaxis: {
            ticksuffix: "%",
            angle: 45,
            rangemode: "tozero",
          },
        },
        legend: {
          traceorder: "reversed",
        },
        hovermode: "closest",
      }}
      useResizeHandler={true}
    />
  );
};

export default WindGraph;
