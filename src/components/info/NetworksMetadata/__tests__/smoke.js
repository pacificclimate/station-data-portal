import React from 'react';
import ReactDOM from 'react-dom';
import NetworksMetadata from '../NetworksMetadata';

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <NetworksMetadata allNetworks={[]}/>,
      div
    );
});

