import React from 'react';
import ReactDOM from 'react-dom';
import StationMetadata from '../StationMetadata';

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <StationMetadata stations={[]} allNetworks={[]} allVariables={[]}/>,
      div
    );
});

