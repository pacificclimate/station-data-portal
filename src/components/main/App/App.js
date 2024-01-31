import React from "react";
import { Container } from "react-bootstrap";

import Disclaimer from "../../info/Disclaimer";
import Header from "../Header/Header";
import Body from "../Body";

import "./App.css";

export default function App({ metaData }) {
  return (
    <Container fluid className="App">
      <Disclaimer disclaimer={metaData.config.disclaimer} />
      <Header config={metaData.config} />
      <Body metaData={metaData} />
    </Container>
  );
}
