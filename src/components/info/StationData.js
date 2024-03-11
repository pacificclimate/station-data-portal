import PropTypes from "prop-types";
import React, { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import pick from "lodash/fp/pick";
import { Button, ButtonToolbar, Col, Row } from "react-bootstrap";
import capitalize from "lodash/fp/capitalize";
import map from "lodash/fp/map";
import { dataDownloadTarget } from "@/utils/pdp-data-service";
import FileFormatSelector from "@/components/selectors/FileFormatSelector";
import ClipToDateControl from "@/components/controls/ClipToDateControl";
import SelectionCounts from "@/components/info/SelectionCounts";
import ObservationCounts from "@/components/info/ObservationCounts";
import SelectionCriteria from "@/components/info/SelectionCriteria";
import UnselectedThings from "@/components/info/UnselectedThings";
import InfoPopup from "@/components/util/InfoPopup";
import logger from "@/logger";
import useConfigContext from "@/state/context-hooks/use-config-context";
import { useStationsStore } from "@/state/client/stations-store";
import { useNetworks } from "@/state/query-hooks/use-networks";
import { useVariables } from "@/state/query-hooks/use-variables";
import { useFrequencies } from "@/state/query-hooks/use-frequencies";

logger.configure({ active: true });

function StationData({ rowClasses }) {
  const config = useConfigContext();
  const { data: allNetworks } = useNetworks();
  const { data: allVariables } = useVariables();
  const { data: allFrequencies } = useFrequencies();
  const {
    polygon,
    startDate,
    endDate,
    selectedNetworksUris,
    selectedVariablesIds,
    selectedFrequencies,
    onlyWithClimatology,
  } = useStationsStore(
    useShallow(
      pick([
        "polygon",
        "startDate",
        "endDate",
        "selectedNetworksUris",
        "selectedVariablesIds",
        "selectedFrequencies",
        "onlyWithClimatology",
      ]),
    ),
  );

  const [dataFormat, setFileFormat] = useState();
  const [clipToDate, setClipToDate] = useState(false);
  const toggleClipToDate = () => setClipToDate(!clipToDate);

  return (
    <>
      <Row className={rowClasses}>
        <SelectionCounts />
        <SelectionCriteria />
      </Row>
      <UnselectedThings
        selectedNetworks={selectedNetworksUris}
        selectedVariables={selectedVariablesIds}
        selectedFrequencies={selectedFrequencies}
      />

      <Row className={rowClasses} key="obs">
        <Col lg={12} md={12} sm={12}>
          <ObservationCounts {...{ clipToDate }} />
        </Col>
      </Row>

      <Row className={rowClasses} key="clip">
        <Col lg={12} md={12} sm={12}>
          <ClipToDateControl value={clipToDate} onChange={toggleClipToDate} />
        </Col>
      </Row>

      <Row className={rowClasses} key="file">
        <Col lg={12} md={12} sm={12}>
          <FileFormatSelector value={dataFormat} onChange={setFileFormat} />
        </Col>
      </Row>

      <Row className={rowClasses} key="button">
        <Col lg={12} md={12} sm={12}>
          <ButtonToolbar>
            {map(
              (dataCategory) => {
                // Disable download buttons if the download URL exceeds
                // maximum allowable length. Provide explanation in popup.
                const downloadUrl = dataDownloadTarget({
                  config,
                  startDate,
                  endDate,
                  selectedNetworksUris,
                  selectedVariablesIds,
                  selectedFrequencies,
                  polygon,
                  clipToDate,
                  onlyWithClimatology,
                  dataCategory,
                  dataFormat,
                  allNetworks,
                  allVariables,
                  allFrequencies,
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
                      download={urlTooLong ? undefined : downloadUrl}
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
  rowClasses: PropTypes.string,
};

export default StationData;
