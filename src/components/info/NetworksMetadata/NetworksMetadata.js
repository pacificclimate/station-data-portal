// This component renders a table showing a selected subset of network metadata.
// This component wraps React Table v6. All props passed to this component are
// passed into React Table.

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactTable from 'react-table';
import logger from '../../../logger';

import 'react-table/react-table.css';
import './NetworksMetadata.css';
import chroma from 'chroma-js';


logger.configure({ active: true });


export default class NetworksMetadata extends Component {
  static propTypes = {
    networks: PropTypes.array.isRequired,
  };

  render() {
    const { networks, ...restProps } = this.props;
    console.log("### NetworksMetadata", networks)
    if (networks === null) {
      return "Loading...";
    }

    const columns = [
      {
        id: 'Colour',
        Header: '',
        minWidth: 20,
        maxWidth: 20,
        accessor: network => (
          <div style={{
            width: "1em",
            height: "1em",
            "border-radius": "0.5em",
            "background-color": chroma(
              network.color ?? process.env.REACT_APP_DEFAULT_NETWORK_COLOR
            ).css(),
          }}>&nbsp;</div>
        )
      },
      {
        id: 'Short Name',
        Header: 'Short Name',
        minWidth: 80,
        maxWidth: 100,
        accessor: 'name'
      },
      {
        id: 'Long Name',
        Header: 'Long Name',
        minWidth: 80,
        maxWidth: 400,
        accessor: 'long_name'
      },
    ];

    return (
      <ReactTable
        data={networks}
        columns={columns}
        defaultPageSize={100}
        {...restProps}
      />
    );
  }
}