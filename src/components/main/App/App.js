import React from "react";
import { Container } from "react-bootstrap";
import Disclaimer from "../../info/Disclaimer";
import Header from "../Header/Header";
import { Outlet } from "react-router-dom";

import "./App.css";
import { useConfigDefaults } from "../../../state/client-server-hooks/use-config-defaults";
export const App = () => {
  const { isLoading, isError } = useConfigDefaults();

  if (isError) {
    return <div>An Error occoured while loading the app configuration.</div>;
  }

  if (isLoading) {
    return <div>Loading configuration...</div>;
  }

  return (
    <Container fluid className="App">
      <Disclaimer />
      <Header />
      <Outlet />
    </Container>
  );
};

export default App;
