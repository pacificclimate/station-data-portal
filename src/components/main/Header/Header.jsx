import React from "react";
import { Row, Col } from "react-bootstrap";
import { useStore } from "../../../state/state-store";
import "./Header.css";

function Header() {
  const config = useStore((state) => state.config);
  return (
    <Row className={"Header"}>
      <Col lg={3} className="text-left">
        <a href="https://pacificclimate.org/">
          <img
            src="/logo.png"
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
