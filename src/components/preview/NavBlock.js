import React from "react";
import {
  Button,
  Card,
  InputGroup,
  Form,
  Stack,
  Spinner,
  Row,
  Col,
} from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useShallow } from "zustand/react/shallow";
import RangeBlock from "./RangeBlock";
import EndDateControl from "./EndDateControl";
import { useStationVariables } from "@/state/query-hooks/use-station-variables";
import { useStore } from "@/state/client/state-store";

const NavBlock = () => {
  const data = useStore(
    useShallow((state) => ({
      showLegend: state.showLegend,
      stationId: state.stationId,
    })),
  );
  const actions = useStore((state) => ({
    setDurationBeforeEnd: state.setDurationBeforeEnd,
    toggleLegend: state.toggleLegend,
  }));
  const {
    data: previewStationVariables,
    isLoading,
    isError,
  } = useStationVariables(data.stationId);

  if (isLoading) {
    return (
      <Row>
        <Col xs={12}>
          <Card className="mb-2 mt-2 ">
            <Card.Body className="d-flex justify-content-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  if (!(previewStationVariables.variables?.length ?? 0 > 0)) {
    return (
      <Row>
        <Col xs={12}>
          <Card className="mb-2 mt-2 ">
            <Card.Body>
              <Card.Title>This station has no associated variables.</Card.Title>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  return (
    <Card className="mb-2 mt-2">
      <Card.Header style={{ backgroundColor: "white" }}>
        <RangeBlock />
      </Card.Header>
      <Card.Body>
        <Stack direction="horizontal" gap={3}>
          <LinkContainer to="/">
            <Button>Back to Map</Button>
          </LinkContainer>
          <InputGroup>
            <Form.Select
              aria-label="duration"
              value={data.selectedDuration?.toString()}
              defaultValue="6"
              onChange={(e) => {
                actions.setDurationBeforeEnd(parseInt(e.target.value, 10));
              }}
            >
              <option value="1">1 Month</option>
              <option value="3">3 Months</option>
              <option value="6">6 Months</option>
            </Form.Select>
            <InputGroup.Text id="basic-addon1">Ending</InputGroup.Text>
            <EndDateControl initialDate={data.selectedEndDate} />
          </InputGroup>
          <Button onClick={actions.toggleLegend}>
            {data.showLegend ? "Hide" : "Show"} Legend
          </Button>
        </Stack>
      </Card.Body>
    </Card>
  );
};

export default NavBlock;
