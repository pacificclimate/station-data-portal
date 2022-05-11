import React from 'react';
import ReactDOM from 'react-dom';
import OneStationMarkers from '../StationMarkers';

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <OneStationMarkers/>,
      div
    );
});

