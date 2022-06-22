import React, { useEffect } from 'react';
import { Grid } from 'react-bootstrap';

import Disclaimer from '../../info/Disclaimer';
import Header from '../Header/Header';
import Body from '../Body';
import { setLethargicMapScrolling } from '../../../utils/leaflet-extensions';
import {
  lethargyEnabled, lethargyStability, lethargySensitivity, lethargyTolerance
} from '../../../utils/configuration';

import './App.css';

export default function App() {
  useEffect(() => {
    if (lethargyEnabled) {
      setLethargicMapScrolling(
        lethargyStability, lethargySensitivity, lethargyTolerance
      );
    }
  }, []);

  return (
    <Grid fluid className="App">
      <Disclaimer/>
      <Header/>
      <Body/>
    </Grid>
  );
}
