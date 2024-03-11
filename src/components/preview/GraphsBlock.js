import { useState, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import pick from "lodash/fp/pick";
import { Card, Col, Row } from "react-bootstrap";
import map from "lodash/fp/map";
import PreviewGraph from "./PreviewGraph";
import { format } from "date-fns";
import { useStore } from "@/state/client/state-store";
import { useStation } from "@/state/query-hooks/use-station";
import { useStationVariables } from "@/state/query-hooks/use-station-variables";
import KVLabel from "./KVLabel";
import { useScrollspy } from "@/utils/hooks/useScrollspy";

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

  const ids = map((variable) => `${previewStation.id}-${variable.id}`)(
    previewStationVariables.variables,
  );
  useEffect(() => {
    const widgetElements = ids.map((item) =>
      document.querySelector(`.row[id="${item}"]`),
    );

    setElements(widgetElements);
  }, []);

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

  return (
    <div id="graphs-root" style={{ marginBottom: "66dvh" }}>
      {map((variable) => (
        <Row
          key={`${previewStation.id}-${variable.id}`}
          id={`${previewStation.id}-${variable.id}`}
          className="pt-1"
          style={{ minHeight: "400px" }}
        >
          <Col xs={graphWidth} className="d-flex justify-content-center">
            {selectedStartDate && selectedEndDate && (
              <PreviewGraph variableId={variable.id} />
            )}
          </Col>
          {showLegend && (
            <Col xs={legendWidth} className="d-flex">
              <Card style={{ width: "100%" }}>
                <Card.Body>
                  <Card.Title>{variable.display_name}</Card.Title>
                  <Card.Body>
                    <KVLabel
                      {...{
                        label: "Description",
                        value: variable.description,
                      }}
                    />
                    <KVLabel
                      {...{
                        label: "Units",
                        value: variable.unit,
                      }}
                    />
                    <KVLabel
                      {...{
                        label: "Cell Method",
                        value: variable.cell_method,
                      }}
                    />
                    <KVLabel
                      {...{
                        label: "Standard Name",
                        value: variable.standard_name,
                      }}
                    />
                    <KVLabel
                      {...{
                        label: "First Observation",
                        value: variable.min_obs_time,
                        formatter: (value) => (
                          <>
                            <br />
                            {format(value, "PPpp")}
                          </>
                        ),
                      }}
                    />
                    <KVLabel
                      {...{
                        label: "Last Observation",
                        value: variable.max_obs_time,
                        formatter: (value) => (
                          <>
                            <br />
                            {format(value, "PPpp")}
                          </>
                        ),
                      }}
                    />
                  </Card.Body>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>
      ))(previewStationVariables.variables)}
    </div>
  );
};

export default GraphsBlock;
