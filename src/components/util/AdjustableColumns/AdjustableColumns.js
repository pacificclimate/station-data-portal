import PropTypes from "prop-types";
import React, { Component, useState } from "react";
import { Row, Col, Button, ButtonToolbar } from "react-bootstrap";
import {
  ChevronBarLeft,
  ChevronBarRight,
  ChevronDoubleLeft,
  ChevronDoubleRight,
  ChevronLeft,
  ChevronRight,
} from "react-bootstrap-icons";
import clone from "lodash/fp/clone";
import concat from "lodash/concat"; // Note: Not FP!
import slice from "lodash/fp/slice";
import zipAll from "lodash/fp/zipAll";
import logger from "@/logger";
import { mapWithKey } from "@/utils/fp/fp";

logger.configure({ active: true });

export const AdjustableColumns = ({ defaultLgs, contents }) => {
  if (defaultLgs.length !== contents.length) {
    throw new Error(
      "Number of column widths and number of columns do not match",
    );
  }

  const [lgs, setLgs] = useState(clone(defaultLgs));
  const handleShrinkLeftBy = (amount) => (index) => () =>
    setLgs((state) => {
      const lgs = state.lgs;
      const n = lgs.length;
      const amt = Math.min(amount, lgs[index]);
      const newSelfWidth = lgs[index] - amt;
      return {
        lgs: concat(
          slice(0, index - 1, lgs),
          lgs[index - 1] + amt, // Expand L neighbout
          newSelfWidth, // Shrink self
          slice(index + 1, n, lgs),
        ),
      };
    });

  const handleShrinkRightBy = (amount) => (index) => () =>
    setLgs((state) => {
      const lgs = state.lgs;
      const n = lgs.length;
      const amt = Math.min(amount, lgs[index]);
      const newSelfWidth = lgs[index] - amt;
      return {
        lgs: concat(
          slice(0, index, lgs),
          newSelfWidth,
          lgs[index + 1] + amt,
          slice(index + 2, n, lgs),
        ),
      };
    });

  const n = contents.length;
  const lgsContents = zipAll([lgs, contents]);
  const buttonProps = { size: "xxs", variant: "outline-dark" };
  const columns = mapWithKey(([lg, content], i) => (
    <Col lg={lg} hidden={lg === 0} key={i}>
      <Row>
        <Col
          lg={12}
          className={"text-center"}
          style={{
            marginTop: "0.25em",
            marginBottom: "0.25em",
            marginLeft: "-2px",
            borderRight: "1px solid #777",
            borderLeft: "1px solid #777",
            zIndex: 1000,
          }}
        >
          {i > 0 && (
            <ButtonToolbar
              className={"justify-content-start"}
              style={{
                position: "relative",
                right: "0.5em",
                zIndex: 99999,
              }}
            >
              {lg > 1 && (
                <Button
                  {...buttonProps}
                  onClick={handleShrinkLeftBy(1)(i)}
                  title={`(${lg}) Click to move column boundary`}
                >
                  <ChevronRight />
                </Button>
              )}
              {lg > 2 && (
                <Button
                  {...buttonProps}
                  onClick={handleShrinkLeftBy(2)(i)}
                  title={`(${lg}) Click to move column boundary`}
                >
                  <ChevronDoubleRight />
                </Button>
              )}
              <Button
                {...buttonProps}
                onClick={handleShrinkLeftBy(lg)(i)}
                title={`(${lg}) Click to hide column`}
              >
                <ChevronBarRight />
              </Button>
            </ButtonToolbar>
          )}
          {i < n - 1 && (
            <ButtonToolbar
              className={"justify-content-end"}
              style={{
                position: "relative",
                left: "0.5em",
                zIndex: 99999,
              }}
            >
              <Button
                {...buttonProps}
                onClick={handleShrinkRightBy(lg)(i)}
                title={`(${lg}) Click to hide column`}
              >
                <ChevronBarLeft />
              </Button>
              {lg > 2 && (
                <Button
                  {...buttonProps}
                  onClick={handleShrinkRightBy(2)(i)}
                  title={`(${lg}) Click to move column boundary`}
                >
                  <ChevronDoubleLeft />
                </Button>
              )}
              {lg > 1 && (
                <Button
                  {...buttonProps}
                  onClick={handleShrinkRightBy(1)(i)}
                  title={`(${lg}) Click to move column boundary`}
                >
                  <ChevronLeft />
                </Button>
              )}
            </ButtonToolbar>
          )}
        </Col>
      </Row>
      <Row>
        <Col lg={12}>{content}</Col>
      </Row>
    </Col>
  ))(lgsContents);

  return <>{columns}</>;
};

AdjustableColumns.propTypes = {
  defaultLgs: PropTypes.array.isRequired,
  contents: PropTypes.array.isRequired,
};

export default AdjustableColumns;
