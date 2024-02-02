import React, { useState } from "react";
import { Button, Card, InputGroup, Form, Stack } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import startOfMonth from "date-fns/startOfMonth";
import endOfMonth from "date-fns/endOfMonth";
import RangeBlock from "./RangeBlock";

const NavBlock = () => {
  let [selectedStart, setSelectedStart] = useState(
    startOfMonth(new Date("1976-10-30T00:00:00Z")),
  );
  let [selectedEnd, setSelectedEnd] = useState(
    endOfMonth(new Date("1977-04-30T00:00:00Z")),
  );

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
              value="6"
              onChange={(e) => {
                console.log("### duration", e.target.value);
              }}
            >
              <option value="1">1 Month</option>
              <option value="3">3 Months</option>
              <option value="6">6 Months</option>
            </Form.Select>
            <InputGroup.Text id="basic-addon1">Ending</InputGroup.Text>
            <Form.Control
              type="date"
              aria-describedby="basic-addon1"
              value={selectedEnd.toISOString().split("T")[0]}
              onChange={(e) => {
                setSelectedEnd(startOfMonth(new Date(e.target.value)));
              }}
            />
          </InputGroup>
          <Button>Hide Variables</Button>
        </Stack>
      </Card.Body>
    </Card>
  );
};

export default NavBlock;
