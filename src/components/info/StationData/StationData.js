import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { ButtonToolbar, Col, Row } from 'react-bootstrap';
import capitalize from 'lodash/fp/capitalize';
import map from 'lodash/fp/map';

import FileFormatSelector from '../../selectors/FileFormatSelector';
import ClipToDateControl from '../../controls/ClipToDateControl';
import ObservationCounts from '../../info/ObservationCounts';

import logger from '../../../logger';

import './StationData.css';

logger.configure({ active: true });


function StationData({
  selectedStations, dataDownloadUrl, dataDownloadFilename, rowClasses
}) {
  const [fileFormat, setFileFormat] = useState();
  const [clipToDate, setClipToDate] = useState(false);
  const toggleClipToDate = () => setClipToDate(!clipToDate);

  return (
    <React.Fragment>
      <Row {...rowClasses}>
        <Col lg={12} md={12} sm={12}>
          <ObservationCounts stations={selectedStations}/>
        </Col>
      </Row>

      <Row {...rowClasses}>
        <Col lg={12} md={12} sm={12}>
          <FileFormatSelector value={fileFormat} onChange={setFileFormat}/>
        </Col>
      </Row>

      <Row {...rowClasses}>
        <Col lg={12} md={12} sm={12}>
          <ClipToDateControl value={clipToDate} onChange={toggleClipToDate}/>
        </Col>
      </Row>

      <Row {...rowClasses}>
        <Col lg={12} md={12} sm={12}>
          <ButtonToolbar>
            {
              map(
                dataCategory => (
                  <a
                    href={dataDownloadUrl({
                      dataCategory, clipToDate, fileFormat
                    })}
                    download={dataDownloadFilename({
                      dataCategory, fileFormat
                    })}
                    className="btn btn-primary btn-sm me-2"
                    key={dataCategory}
                  >
                    Download {capitalize(dataCategory)}
                  </a>
                ),
                ['timeseries', 'climatology']
              )
            }
          </ButtonToolbar>
        </Col>
      </Row>

    </React.Fragment>
  );
}

StationData.propTypes = {
  selectedStations: PropTypes.array.isRequired,
  dataDownloadUrl: PropTypes.func.isRequired,
  dataDownloadFilename: PropTypes.func.isRequired,
};

export default StationData;
