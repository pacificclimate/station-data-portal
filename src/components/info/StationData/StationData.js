import PropTypes from "prop-types";
import React, { useState } from "react";
import { Button, ButtonToolbar, Col, Row } from "react-bootstrap";
import capitalize from "lodash/fp/capitalize";
import map from "lodash/fp/map";
import { useStore } from "../../../state/state-store";
import FileFormatSelector from "../../selectors/FileFormatSelector";
import ClipToDateControl from "../../controls/ClipToDateControl";
import ObservationCounts from "../../info/ObservationCounts";
import InfoPopup from "../../util/InfoPopup";

import logger from "../../../logger";

import "./StationData.css";

logger.configure({ active: true });

function StationData({
  filterValues,
  selectedStations,
  dataDownloadUrl,
  dataDownloadFilename,
  rowClasses,
}) {
  const config = useStore((state) => state.config);
  const [fileFormat, setFileFormat] = useState();
  const [clipToDate, setClipToDate] = useState(false);
  const toggleClipToDate = () => setClipToDate(!clipToDate);

  return (
    <>
      <Row {...rowClasses} key="obs">
        <Col lg={12} md={12} sm={12}>
          <ObservationCounts
            filterValues={filterValues}
            clipToDate={clipToDate}
            stations={selectedStations}
          />
        </Col>
      </Row>

      <Row {...rowClasses} key="clip">
        <Col lg={12} md={12} sm={12}>
          <ClipToDateControl value={clipToDate} onChange={toggleClipToDate} />
        </Col>
      </Row>

      <Row {...rowClasses} key="file">
        <Col lg={12} md={12} sm={12}>
          <FileFormatSelector value={fileFormat} onChange={setFileFormat} />
        </Col>
      </Row>

      <Row {...rowClasses} key="button">
        <Col lg={12} md={12} sm={12}>
          <ButtonToolbar>
            {map(
              (dataCategory) => {
                // Disable download buttons if the download URL exceeds
                // maximum allowable length. Provide explanation in popup.
                const downloadUrl = dataDownloadUrl({
                  dataCategory,
                  clipToDate,
                  fileFormat,
                });
                const linkLabel = `Download ${capitalize(dataCategory)}`;
                const urlTooLong = downloadUrl.length > config.maxUrlLength;
                return (
                  <React.Fragment key={dataCategory}>
                    <Button
                      variant={"primary"}
                      size={"sm"}
                      className={"me-2"}
                      disabled={urlTooLong}
                      href={urlTooLong ? undefined : downloadUrl}
                      download={
                        urlTooLong
                          ? undefined
                          : dataDownloadFilename({ dataCategory, fileFormat })
                      }
                    >
                      {linkLabel}
                    </Button>
                    {urlTooLong && (
                      <span className={"me-2"}>
                        <InfoPopup title={"Download button disabled"}>
                          <p>
                            This button is disabled because the length of the
                            URL for the download ({downloadUrl.length}) exceeds
                            the maximum allowable length for URLs (
                            {config.maxUrlLength}).
                          </p>
                          <p>
                            This is a technical issue, which will be fixed in an
                            upcoming release. In the meantime, you can do the
                            following:
                          </p>
                          <p>
                            The most likely cause of this problem is that you
                            selected a subset of Variables to download. Please
                            try selecting either fewer Variables, or all (use
                            the **All** button).
                          </p>
                          <p>
                            You can also try the same strategy with the Networks
                            and/or Frequencies selectors, but since they have
                            many fewer options, they are less likely to be
                            either the cause or the solution.
                          </p>
                        </InfoPopup>
                      </span>
                    )}
                  </React.Fragment>
                );
              },
              ["timeseries", "climatology"],
            )}
          </ButtonToolbar>
        </Col>
      </Row>
    </>
  );
}

StationData.propTypes = {
  selectedStations: PropTypes.array.isRequired,
  dataDownloadUrl: PropTypes.func.isRequired,
  dataDownloadFilename: PropTypes.func.isRequired,
};

export default StationData;
