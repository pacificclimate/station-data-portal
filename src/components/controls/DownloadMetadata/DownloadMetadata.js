import PropTypes from 'prop-types';
import React from 'react';

import logger from '../../../logger';

import './DownloadMetadata.css';
import { Button } from 'react-bootstrap';

logger.configure({ active: true });

function DownloadMetadata({ data, columns }) {
  return (
    <Button disabled title={"This function is not yet implemented"}>
      Download Metadata
    </Button>
  );
}

DownloadMetadata.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
};

export default DownloadMetadata;
