import { useState, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import pick from "lodash/fp/pick";
import { Card, Col, Row } from "react-bootstrap";
import map from "lodash/fp/map";
import PreviewGraph from "./PreviewGraph";
import WindGraph from "./WindGraph";
import { format } from "date-fns";
import { useStore } from "@/state/client/state-store";
import { useStation } from "@/state/query-hooks/use-station";
import { useStationVariables } from "@/state/query-hooks/use-station-variables";
import KVLabel from "./KVLabel";
import { useScrollspy } from "@/utils/hooks/useScrollspy";

const formatObservationTime = (value) => (
  <>
    <br />
    {format(value, "PPpp")}
  </>
);

const variableLegendItems = (variable) => [
  { label: "Description", value: variable.description },
  { label: "Units", value: variable.unit },
  { label: "Cell Method", value: variable.cell_method },
  { label: "Standard Name", value: variable.standard_name },
  {
    label: "First Observation",
    value: variable.min_obs_time,
    formatter: formatObservationTime,
  },
  {
    label: "Last Observation",
    value: variable.max_obs_time,
    formatter: formatObservationTime,
  },
];

const windLegendItems = (speedVariable, directionVariable) => [
  { label: "Speed", value: speedVariable.display_name },
  { label: "Speed Units", value: speedVariable.unit },
  { label: "Direction", value: directionVariable.display_name },
  { label: "Direction Units", value: directionVariable.unit },
  {
    label: "Direction Standard Name",
    value: directionVariable.standard_name,
  },
  {
    label: "First Observation",
    value:
      speedVariable.min_obs_time < directionVariable.min_obs_time
        ? speedVariable.min_obs_time
        : directionVariable.min_obs_time,
    formatter: formatObservationTime,
  },
  {
    label: "Last Observation",
    value:
      speedVariable.max_obs_time > directionVariable.max_obs_time
        ? speedVariable.max_obs_time
        : directionVariable.max_obs_time,
    formatter: formatObservationTime,
  },
];

const GraphRow = ({
  id,
  title,
  children,
  legendItems,
  showLegend,
  graphWidth,
  legendWidth,
}) => (
  <Row id={id} className="pt-1" style={{ minHeight: "400px" }}>
    <Col xs={graphWidth} className="d-flex justify-content-center">
      {children}
    </Col>
    {showLegend && (
      <Col xs={legendWidth} className="d-flex">
        <Card style={{ width: "100%" }}>
          <Card.Body>
            <Card.Title>{title}</Card.Title>
            <Card.Body>
              {legendItems.map((item) => (
                <KVLabel key={item.label} {...item} />
              ))}
            </Card.Body>
          </Card.Body>
        </Card>
      </Col>
    )}
  </Row>
);

const GraphsBlock = () => {
  const {
    stationId,
    showLegend,
    selectedStartDate,
    selectedEndDate,
    setActiveGraph,
  } = useStore(
    useShallow(
      pick([
        "stationId",
        "showLegend",
        "selectedStartDate",
        "selectedEndDate",
        "setActiveGraph",
      ]),
    ),
  );
  const {
    data: previewStation,
    isLoading: isStationLoading,
    isStationisError,
  } = useStation(stationId);
  const {
    data: previewStationVariables,
    isLoading: isVariableLoading,
    isError: isVariableError,
  } = useStationVariables(stationId);
  const legendWidth = showLegend ? 4 : 0;
  const graphWidth = 12 - legendWidth;

  const [elements, setElements] = useState([]);
  const [currentActiveIndex] = useScrollspy(elements, {
    offset: 300,
  });
  console.log(currentActiveIndex);
  useEffect(() => {
    setActiveGraph(currentActiveIndex);
  }, [currentActiveIndex]);

  if (isStationLoading || isVariableLoading) {
    return (
      <Row id="graphs-root">
        <Col xs={12} className="d-flex justify-content-center">
          <Card>
            <Card.Body>
              <Card.Title>Loading...</Card.Title>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  if (isStationisError || isVariableError) {
    return (
      <Row id="graphs-root">
        <Col xs={12} className="d-flex justify-content-center">
          <Card>
            <Card.Body>
              <Card.Title>Error loading station variable data.</Card.Title>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  if (!(previewStationVariables.variables?.length ?? 0 > 0)) {
    return (
      <Row id="graphs-root">
        <Col xs={12} className="d-flex justify-content-center">
          <Card>
            <Card.Body>
              <Card.Title>No Variables available for this station.</Card.Title>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  const windSpeedVariable = previewStationVariables.variables.find(
    (variable) => variable.standard_name === "wind_speed",
  );

  const windDirectionVariable = previewStationVariables.variables.find(
    (variable) => variable.standard_name === "wind_from_direction",
  );

  const hasWindGraph = windSpeedVariable && windDirectionVariable;

  const graphVariables = hasWindGraph
    ? previewStationVariables.variables.filter(
        (variable) =>
          variable.id !== windSpeedVariable.id &&
          variable.id !== windDirectionVariable.id,
      )
    : previewStationVariables.variables;

  const ids = [
    ...(hasWindGraph ? [`${previewStation.id}-wind`] : []),
    ...map((variable) => `${previewStation.id}-${variable.id}`)(graphVariables),
  ];

  useEffect(() => {
    const widgetElements = ids.map((item) =>
      document.querySelector(`.row[id="${item}"]`),
    );

    setElements(widgetElements);
  }, []);

  return (
    <div id="graphs-root" style={{ marginBottom: "66dvh" }}>
      {hasWindGraph && (
        <GraphRow
          key={`${previewStation.id}-wind`}
          id={`${previewStation.id}-wind`}
          title="Wind"
          legendItems={windLegendItems(
            windSpeedVariable,
            windDirectionVariable,
          )}
          showLegend={showLegend}
          graphWidth={graphWidth}
          legendWidth={legendWidth}
        >
          {selectedStartDate && selectedEndDate && (
            <WindGraph
              speedVariableId={windSpeedVariable.id}
              directionVariableId={windDirectionVariable.id}
            />
          )}
        </GraphRow>
      )}

      {map((variable) => (
        <GraphRow
          key={`${previewStation.id}-${variable.id}`}
          id={`${previewStation.id}-${variable.id}`}
          title={variable.display_name}
          legendItems={variableLegendItems(variable)}
          showLegend={showLegend}
          graphWidth={graphWidth}
          legendWidth={legendWidth}
        >
          {selectedStartDate && selectedEndDate && (
            <PreviewGraph variableId={variable.id} />
          )}
        </GraphRow>
      ))(graphVariables)}
    </div>
  );
};

export default GraphsBlock;
