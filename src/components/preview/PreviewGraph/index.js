import React, { useState } from "react";
import Plot from "react-plotly.js";
import map from "lodash/fp/map";

const PreviewGraph = ({ plotData }) => {
  // const [plot, setPlot] = useState({
  //     data: [], layout: {}, frames: [], config: {}
  // }, [plotData]);
  console.log("### variable", plotData);
  if ((plotData.observations?.length ?? 0) === 0) {
    return (
      <div>No data found for {plotData.variable.name} in this time period.</div>
    );
  }
  return (
    <Plot
      style={{ width: "100%", height: "400px" }}
      data={[
        {
          x: map("time", plotData.observations),
          y: map("value", plotData.observations),
          type: "scatter",
          mode: "lines",
          marker: { color: "red" },
        },
      ]}
      layout={{
        autosize: true,
        title: plotData.variable.name,
        xaxis: {
          title: "Time",
          type: "date",
        },
        yaxis: {
          title: plotData.variable.unit,
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
