import React  from 'react';
import { Grid } from 'react-bootstrap';

import logger from '../../../logger';
import Header from '../Header/Header';

import Body from '../Body';

import './App.css';

export default function App() {
    return (
      <Grid fluid className="App">
        <Header/>
        <Body/>
      </Grid>
    );
}
