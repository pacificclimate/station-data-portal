import React from "react";
import { Spinner } from "react-bootstrap";
import map from "lodash/fp/map";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "@/state/client/state-store";
import { useStationVariableObservations } from "@/state/query-hooks/use-station-variable-observations";
import { useConfigContext } from "@/state/context-hooks/use-config-context";

// Importing a smaller version of plotly allows us to significantly reduce the
// bundle size (approx 5MB to 1MB) over the full version of plotly.
// https://github.com/plotly/react-plotly.js?tab=readme-ov-file#customizing-the-plotlyjs-bundle
import Plotly from "plotly.js-basic-dist";
import createPlotlyComponent from "react-plotly.js/factory";

const Plot = createPlotlyComponent(Plotly);

const PreviewGraph = ({ variableId }) => {
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
    data: previewObservations,
    isLoading,
    isError,
  } = useStationVariableObservations(
    stationId,
    variableId,
    selectedStartDate,
    selectedEndDate,
  );

  if (isLoading) {
    return (
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    );
  }

  if (isError) {
    return <div>Error loading observation data</div>;
  }

  if ((previewObservations?.observations?.length ?? 0) === 0) {
    return (
      <div>
        No data found for {previewObservations.variable.name} in this time
        period.
      </div>
    );
  }

  return (
    <Plot
      style={{ width: "100%", height: "400px" }}
      data={[
        {
          x: map("time", previewObservations.observations),
          y: map("value", previewObservations.observations),
          type: "scatter",
          mode: "lines",
          marker: { color: config.plotColor },
        },
      ]}
      layout={{
        // Setting these margins causes the graph to fill the available space
        // l (left) and b (bottom) are left slightly larger for axis labels
        margin: {
          t: 20, //top
          l: 50, //left
          r: 20, //right
          b: 50, //bottom
        },
        autosize: true,
        title: showLegend ? null : previewObservations.variable.name,
        xaxis: {
          title: "Time",
          type: "date",
          autorange: false,
          range: [selectedStartDate, selectedEndDate],
        },
        yaxis: {
          title: previewObservations.variable.unit,
        },
      }}
      useResizeHandler={true}
      //onInitialized={(figure) => {setPlot(figure)}}
      //onUpdate is wierdly spammy, leaving this off for now
      //onUpdate={(figure) => {console.log(figure); setPlot(figure)}}
    />
  );
};

export default PreviewGraph;
