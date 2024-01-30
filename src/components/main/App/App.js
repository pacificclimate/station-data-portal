import React from "react";
import { Container } from "react-bootstrap";

import Disclaimer from "../../info/Disclaimer";
import Header from "../Header/Header";
import Body from "../Body";

import "./App.css";

export default function App({ config }) {
  return (
    <Container fluid className="App">
      <Disclaimer disclaimer={config.disclaimer} />
      <Header config={config} />
      <Body config={config} />
    </Container>
  );
}
