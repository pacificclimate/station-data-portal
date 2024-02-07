import React from "react";
import {
  Button,
  Card,
  InputGroup,
  Form,
  Stack,
  Spinner,
} from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "../../../state/state-store";
import RangeBlock from "./RangeBlock";
import EndDateControl from "./EndDateControl";

const NavBlock = () => {
  const data = useStore(
    useShallow((state) => ({
      previewStationVariables: state.previewStationVariables,
      selectedEndDate: state.selectedEndDate,
      selectedDuration: state.selectedDuration,
      showLegend: state.showLegend,
    })),
  );

  const actions = useStore((state) => ({
    setSelectedEndDate: state.setSelectedEndDate,
    setDurationBeforeEnd: state.setDurationBeforeEnd,
    toggleLegend: state.toggleLegend,
  }));

  if (!data.previewStationVariables || !data.selectedEndDate) {
    return <Spinner />;
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
              value={data.selectedDuration}
              onChange={(e) => {
                actions.setDurationBeforeEnd(e.target.value);
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
