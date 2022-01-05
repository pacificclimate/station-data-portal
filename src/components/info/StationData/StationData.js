import PropTypes from 'prop-types';
import React, { useState } from 'react';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import capitalize from 'react-bootstrap/lib/utils/capitalize';
import map from 'lodash/fp/map';

import FileFormatSelector from '../../selectors/FileFormatSelector';
import ClipToDateControl from '../../controls/ClipToDateControl';
import ObservationCounts from '../../info/ObservationCounts';

import logger from '../../../logger';

import './StationData.css';

logger.configure({ active: true });


function StationData({
  selectedStations, dataDownloadUrl, dataDownloadFilename
}) {
  const [fileFormat, setFileFormat] = useState();
  const [clipToDate, setClipToDate] = useState(false);
  const toggleClipToDate = () => setClipToDate(!clipToDate);

  return (
    <React.Fragment>
      <ObservationCounts stations={selectedStations}/>

      <FileFormatSelector value={fileFormat} onChange={setFileFormat}/>

      <ClipToDateControl value={clipToDate} onChange={toggleClipToDate}/>

      <ButtonToolbar>
        {
          map(
            dataCategory => (
              <a
                href={dataDownloadUrl({ dataCategory, clipToDate, fileFormat })}
                download={dataDownloadFilename({ dataCategory, fileFormat })}
                className="btn btn-primary"
              >
                Download {capitalize(dataCategory)}
              </a>
            ),
            ['timeseries', 'climatology']
          )
        }
      </ButtonToolbar>

    </React.Fragment>
  );
}

StationData.propTypes = {
  selectedStations: PropTypes.array.isRequired,
  dataDownloadUrl: PropTypes.func.isRequired,
  dataDownloadFilename: PropTypes.func.isRequired,
};

export default StationData;
