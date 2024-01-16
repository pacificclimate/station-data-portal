import React, { useEffect } from 'react';
import { Container } from 'react-bootstrap';

import Disclaimer from "../../info/Disclaimer";
import Header from "../Header/Header";
import Body from "../Body";
import useInitializeApp from "./app-initialization";
import { useStore } from '../../../state/state-store';

import './App.css';


export default function App() {
  // must be invoked before any other items dependent on context.
  const initialize = useStore(state => state.initialize);
  const isConfigLoaded = useStore(state => state.isConfigLoaded);
  const configErrorMessage = useStore(state => state.configError);
  const config = useStore(state => state.config);

  useEffect(() => {
    if (!isConfigLoaded() && configErrorMessage === null) {
      initialize();
    }
  });

  if (configErrorMessage !== null) {
    return <div>{configErrorMessage}</div>;
  }

  if (config === null) {
    return <div>Loading configuration...</div>;
  }

  useInitializeApp(config);

  return (
    <Container fluid className="App">
      <Disclaimer />
      <Header />
      <Body />
    </Container>
  );
}
