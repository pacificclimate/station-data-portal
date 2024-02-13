import React, { useEffect } from "react";
import { Container } from "react-bootstrap";
import Disclaimer from "../../info/Disclaimer";
import Header from "../Header/Header";
import useInitializeApp from "./use-initialize-app";
import { Outlet } from "react-router-dom";

import "./App.css";
import { useConfig } from "../../../state/query-hooks/use-config";

export default function App() {
  const { isLoading, isError } = useConfig();
  useInitializeApp();

  if (isError) {
    return <div>{configErrorMessage}</div>;
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
}
