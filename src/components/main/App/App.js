import React from "react";
import { Container } from "react-bootstrap";

import Disclaimer from "../../info/Disclaimer";
import Header from "../Header/Header";
import Body from "../Body";
import useInitializeApp from "./app-initialization";

import "./App.css";
import ConfigContext, { useFetchConfigContext } from "../ConfigContext";

export default function App() {
  // must be invoked before any other items dependent on context.
  const [config, configErrorMessage] = useFetchConfigContext({});

  useInitializeApp(config);

  if (configErrorMessage !== null) {
    return <div>{configErrorMessage}</div>;
  }

  if (config === null) {
    return <div>Loading configuration...</div>;
  }

  return (
    <ConfigContext.Provider value={config}>
      <Container fluid className="App">
        <Disclaimer />
        <Header />
        <Body />
      </Container>
    </ConfigContext.Provider>
  );
}
