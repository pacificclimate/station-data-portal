import React  from 'react';
import { Grid } from 'react-bootstrap';

import Disclaimer from '../../info/Disclaimer';
import Header from '../Header/Header';
import Body from '../Body';

import './App.css';

export default function App() {
  return (
    <Grid fluid className="App">
      <Disclaimer/>
      <Header/>
      <Body/>
    </Grid>
  );
}
