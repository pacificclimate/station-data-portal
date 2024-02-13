import React from "react";
import { Row, Col } from "react-bootstrap";
import "./Header.css";
import { useConfig } from "../../../state/query-hooks/use-config";

function Header() {
  const { data: config } = useConfig();
  return (
    <Row className={"Header"}>
      <Col lg={3} className="text-left">
        <a href="https://pacificclimate.org/">
          <img
            src={require("./logo.png")}
            width="328"
            height="38"
            alt="Pacific Climate Impacts Consortium"
          />
        </a>
      </Col>
      <Col lg={7}>
        <h1>{config.appTitle}</h1>
      </Col>
      <Col lg={2} className="text-right">
        <p>Version: {config.appVersion}</p>
        {config.userDocs.showLink && (
          <p>
            <a href={config.userDocs.url} target="_blank">
              {config.userDocs.text}
            </a>
          </p>
        )}
      </Col>
    </Row>
  );
}

export default Header;
