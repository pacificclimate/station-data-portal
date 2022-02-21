import React  from 'react';
import { Grid } from 'react-bootstrap';

import logger from '../../../logger';
import Header from '../Header/Header';

import VersionA from '../VersionA';

import './App.css';

export default function App() {
    return (
      <Grid fluid className="App">
        <Header/>
        <VersionA/>
      </Grid>
    );
}
