import React from "react";
import { Container } from "react-bootstrap";
import Disclaimer from "@/components/info/Disclaimer";
import Header from "@/components/main/Header";
import { Outlet } from "react-router-dom";
import { useConfigDefaults } from "@/state/client-server-hooks/use-config-defaults";

import "./App.css";

import { ConfigContext } from "@/state/context-hooks/use-config-context";

export const App = () => {
  const { data: config, isLoading, isError } = useConfigDefaults();

  if (isError) {
    return <div>An Error occoured while loading the app configuration.</div>;
  }

  if (isLoading) {
    return <div>Loading configuration...</div>;
  }

  return (
    <ConfigContext.Provider value={config}>
      <Container fluid className="App">
        <Disclaimer />
        <Header />
        <Outlet />
      </Container>
    </ConfigContext.Provider>
  );
};

export default App;
