import React, { useState } from "react";
import Plot from "react-plotly.js";
import map from "lodash/fp/map";

const PreviewGraph = ({ plotData }) => {
  // const [plot, setPlot] = useState({
  //     data: [], layout: {}, frames: [], config: {}
  // }, [plotData]);
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
        // Setting these margins causes the graph to fill the available space
        margin: {
          t: 20, //top
          l: 50, //left
          r: 20, //right
          b: 50, //bottom
        },
        autosize: true,
        title: null, //plotData.variable.name,
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
