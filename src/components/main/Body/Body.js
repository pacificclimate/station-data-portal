import React, { useEffect, useState } from 'react';
// import { Col, Panel, Row, Tab, Tabs } from 'react-bootstrap';
// import Select from 'react-select';
// import memoize from 'memoize-one';
// import flow from 'lodash/fp/flow';
// import get from 'lodash/fp/get';
// import map from 'lodash/fp/map';
// import filter from 'lodash/fp/filter';
// import join from 'lodash/fp/join';
// import tap from 'lodash/fp/tap';
//
import css from '../common.module.css';

import logger from '../../../logger';
// import NetworkSelector from '../../selectors/NetworkSelector';
// import {
//   getFrequencies,
//   getNetworks,
//   getStations,
//   getVariables,
// } from '../../../data-services/station-data-service';
// import { dataDownloadTarget } from '../../../data-services/pdp-data-service';
// import VariableSelector from '../../selectors/VariableSelector';
// import FrequencySelector
//   from '../../selectors/FrequencySelector/FrequencySelector';
// import DateSelector from '../../selectors/DateSelector';
// import {
//   stationFilter as stationFilterRaw,
//   stationInsideMultiPolygon
// } from '../../../utils/station-filtering';
// import OnlyWithClimatologyControl
//   from '../../controls/OnlyWithClimatologyControl';
import StationMap from '../../maps/StationMap';
// import StationMetadata from '../../info/StationMetadata';
// import StationData from '../../info/StationData';
// import NetworksMetadata from '../../info/NetworksMetadata';
// import SelectionCounts from '../../info/SelectionCounts';
// import SelectionCriteria from '../../info/SelectionCriteria';
// import AdjustableColumns from '../../util/AdjustableColumns';
import baseMaps from '../../maps/baseMaps';


logger.configure({ active: true });


// const commonSelectorStyles = {
//   menu: (provided) => {
//     return {
//       ...provided,
//       zIndex: 999,
//     }
//   },
//   valueContainer: (provided, state) => ({
//     ...provided,
//     maxHeight: '10em',
//     overflowY: 'auto',
//   }),
//   indicatorsContainer: (provided, state) => ({
//     ...provided,
//     width: '2em',
//   }),
//   option: (styles) => {
//     return {
//       ...styles,
//       padding: '0.5em',
//       fontSize: '0.9em',
//     }
//   }
// };
//
//
// const defaultLgs = [7, 5];
//
// const stnsLimitOptions =
//   [100, 500, 1000, 2000, 4000, 8000].map(value => ({
//     value, label: value.toString()
//   }));
//
//
// const stationDebugFetchOptions =
//   (process.env.REACT_APP_DEBUG_STATION_FETCH_OPTIONS || "").toLowerCase()
//   === "true";


function Body() {
  const baseMap = baseMaps["BC"];

  // Exp 4: StationMap with drawing tool: OK
  // Exp 3: minimal StationMap: OK
  return (
    <div className={css.portal}>
      <StationMap
        {...baseMap}
        stations={[]}
        allNetworks={[]}
        allVariables={[]}
      />
    </div>
  )

  // Exp 2: Base map: OK
  const { BaseMap, initialViewport } = baseMap;
  return (
    <div className={css.portal}>
      <BaseMap
        zoom={initialViewport.zoom}
        center={initialViewport.center}
        preferCanvas={true}
      />
    </div>
  )

  // Exp 1: empty: OK
  return (
    "foo"
  );

  // const [startDate, setStartDate] = useState(null);
  // const [endDate, setEndDate] = useState(null);
  //
  // const [allNetworks, setAllNetworks] = useState(null);
  // const [selectedNetworksOptions, setSelectedNetworksOptions] = useState([]);
  // const [networkActions, setNetworkActions] = useState(null);
  //
  // const [allVariables, setAllVariables] = useState(null);
  // const [selectedVariablesOptions, setSelectedVariablesOptions] = useState([]);
  // const [variableActions, setVariableActions] = useState(null);
  //
  // const [allFrequencies, setAllFrequencies] = useState(null);
  // const [selectedFrequenciesOptions, setSelectedFrequenciesOptions] = useState([]);
  // const [frequencyActions, setFrequencyActions] = useState(null);
  //
  // const [onlyWithClimatology, setOnlyWithClimatology] = useState(false);
  //
  // const [allStations, setAllStations] = useState(null);
  //
  // const [area, setArea] = useState(undefined);
  // const [stnsLimit, setStnsLimit] = useState(stnsLimitOptions[0]);
  //
  // // // TODO: Remove? Not presently used, but there is commented out code
  // // //  in Filters tab that uses them.
  // // const handleClickAll = () => {
  // //   networkActions.selectAll();
  // //   variableActions.selectAll();
  // //   frequencyActions.selectAll();
  // // };
  // // const handleClickNone = () => {
  // //   networkActions.selectNone();
  // //   variableActions.selectNone();
  // //   frequencyActions.selectNone();
  // // };
  // //
  // const toggleOnlyWithClimatology = () =>
  //   setOnlyWithClimatology(!onlyWithClimatology);
  //
  // useEffect(() => {
  //   getNetworks().then(response => setAllNetworks(response.data));
  // }, []);
  //
  // useEffect(() => {
  //   getVariables().then(response => setAllVariables(response.data));
  // }, []);
  //
  // useEffect(() => {
  //   getFrequencies().then(response => setAllFrequencies(response.data));
  // }, []);
  //
  // useEffect(() => {
  //   getStations({
  //     compact: true,
  //     ...(stationDebugFetchOptions && { limit: stnsLimit.value } )
  //   })
  //     .then(response => setAllStations(response.data));
  // }, [stnsLimit]);
  //
  // const stationFilter = memoize(stationFilterRaw);
  //
  // const dataDownloadUrl = ({ dataCategory, clipToDate, fileFormat }) => {
  //   // Check whether state has settled. Each selector calls an onReady callback
  //   // to export information (e.g., all its options) that it has set up
  //   // internally. In retrospect, this is a too-clever solution to the problem
  //   // of passing a pile of props around, but it's what we've got.
  //   if (!networkActions || !variableActions || !frequencyActions) {
  //     return "#";
  //   }
  //
  //   return dataDownloadTarget({
  //     startDate: startDate,
  //     endDate: endDate,
  //     selectedNetworksOptions: selectedNetworksOptions,
  //     selectedVariablesOptions: selectedVariablesOptions,
  //     selectedFrequenciesOptions: selectedFrequenciesOptions,
  //     polygon: area,
  //     onlyWithClimatology: onlyWithClimatology,
  //     allNetworks: networkActions.getAllOptions(),
  //     allVariables: variableActions.getAllOptions(),
  //     allFrequencies: frequencyActions.getAllOptions(),
  //     dataCategory,
  //     clipToDate,
  //     dataFormat: fileFormat,
  //   });
  // };
  //
  // const dataDownloadFilename = ({ dataCategory, fileFormat }) => {
  //   return `${{ dataCategory, fileFormat }}.${get('value', fileFormat)}`;
  // }
  //
  // const filteredStations = stationFilter(
  //   startDate,
  //   endDate,
  //   selectedNetworksOptions,
  //   selectedVariablesOptions,
  //   selectedFrequenciesOptions,
  //   onlyWithClimatology,
  //   area,
  //   allNetworks,
  //   allVariables,
  //   allStations,
  // );
  //
  // const stationInsideArea = stationInsideMultiPolygon(area);
  // const selectedStations = filter(stationInsideArea, filteredStations);
  //
  // const selections = [
  //   {
  //     name: 'networks',
  //     items: selectedNetworksOptions,
  //   },
  //   {
  //     name: 'variables',
  //     items: selectedVariablesOptions,
  //   },
  //   {
  //     name: 'frequencies',
  //     items: selectedFrequenciesOptions,
  //   },
  // ];
  //
  // const unselectedThings = flow(
  //   filter(thing => thing.items.length === 0),
  //   map(thing => thing.name),
  //   join(', or '),
  // )(selections);
  //
  // return (
  //   <div className={css.portal}>
  //     <Row>
  //       <AdjustableColumns
  //         defaultLgs={defaultLgs}
  //         contents={[
  //           // "map" ||  // Uncomment to suppress map
  //           <StationMap
  //             {...baseMaps[process.env.REACT_APP_BASE_MAP]}
  //             stations={filteredStations}
  //             allNetworks={allNetworks}
  //             allVariables={allVariables}
  //             onSetArea={setArea}
  //           />,
  //
  //           <Panel style={{ marginLeft: '-15px', marginRight: '-10px' }}>
  //             <Panel.Body>
  //               <Tabs
  //                 id="non-map-controls"
  //                 defaultActiveKey={'Filters'}
  //                 className={css.mainTabs}
  //               >
  //                 <Tab eventKey={'Filters'} title={'Station Filters'}>
  //                   <Row>
  //                     <Col lg={12} md={12} sm={12}>
  //                       {stationDebugFetchOptions && (
  //                         <Row>
  //                           <Col lg={6}>Fetch limit</Col>
  //                           <Col lg={6}>
  //                             <Select
  //                               options={stnsLimitOptions}
  //                               value={stnsLimit}
  //                               onChange={setStnsLimit}
  //                             />
  //                           </Col>
  //                         </Row>
  //                       )}
  //                       <SelectionCounts
  //                         allStations={allStations}
  //                         selectedStations={selectedStations}
  //                       />
  //                       <p>
  //                         (See Station Metadata and Station Data tabs for details)
  //                       </p>
  //                     </Col>
  //                   </Row>
  //                   <Row>
  //                     <Col lg={6} md={6} sm={6}>
  //                       {/*<Button bsSize={'small'} onClick={handleClickAll}>Select all criteria</Button>*/}
  //                       {/*<Button bsSize={'small'} onClick={handleClickNone}>Clear all criteria</Button>*/}
  //                       <DateSelector
  //                         value={startDate}
  //                         onChange={setStartDate}
  //                         label={'Start Date'}
  //                       />
  //                     </Col>
  //                     <Col lg={6} md={6} sm={6}>
  //                       <DateSelector
  //                         value={endDate}
  //                         onChange={setEndDate}
  //                         label={'End Date'}
  //                       />
  //                     </Col>
  //                     <Col lg={12} md={12} sm={12}>
  //                       <OnlyWithClimatologyControl
  //                         value={onlyWithClimatology}
  //                         onChange={toggleOnlyWithClimatology}
  //                       />
  //                     </Col>
  //                   </Row>
  //                   <Row>
  //                     <Col lg={12} md={12} sm={12}>
  //                       <NetworkSelector
  //                         allNetworks={allNetworks}
  //                         onReady={setNetworkActions}
  //                         value={selectedNetworksOptions}
  //                         onChange={setSelectedNetworksOptions}
  //                         isSearchable
  //                         isClearable={false}
  //                         styles={commonSelectorStyles}
  //                       />
  //                       {/*<JSONstringify object={selectedNetworksOptions}/>*/}
  //                     </Col>
  //                   </Row>
  //                   <Row>
  //                     <Col lg={12} md={12} sm={12}>
  //                       <VariableSelector
  //                         allVariables={allVariables}
  //                         onReady={setVariableActions}
  //                         value={selectedVariablesOptions}
  //                         onChange={setSelectedVariablesOptions}
  //                         isSearchable
  //                         isClearable={false}
  //                         styles={commonSelectorStyles}
  //                       />
  //                       {/*<JSONstringify object={selectedVariablesOptions}/>*/}
  //                     </Col>
  //                   </Row>
  //                   <Row>
  //                     <Col lg={12} md={12} sm={12}>
  //                       <FrequencySelector
  //                         allFrequencies={allFrequencies}
  //                         onReady={setFrequencyActions}
  //                         value={selectedFrequenciesOptions}
  //                         onChange={setSelectedFrequenciesOptions}
  //                         isClearable={false}
  //                         styles={commonSelectorStyles}
  //                       />
  //                       {/*<JSONstringify object={selectedFrequenciesOptions}/>*/}
  //                     </Col>
  //                   </Row>
  //                 </Tab>
  //
  //                 <Tab eventKey={'Metadata'} title={'Station Metadata'}>
  //                   <SelectionCounts
  //                     allStations={allStations}
  //                     selectedStations={selectedStations}
  //                   />
  //                   <StationMetadata
  //                     stations={selectedStations}
  //                     allNetworks={allNetworks}
  //                     allVariables={allVariables}
  //                   />
  //                 </Tab>
  //
  //                 <Tab eventKey={'Data'} title={'Station Data'}>
  //                   <SelectionCounts
  //                     allStations={allStations}
  //                     selectedStations={selectedStations}
  //                   />
  //                   <SelectionCriteria/>
  //                   {
  //                     unselectedThings &&
  //                     <p>You haven't selected any {unselectedThings}.</p>
  //                   }
  //
  //                   <StationData
  //                     selectedStations={selectedStations}
  //                     dataDownloadUrl={dataDownloadUrl}
  //                     dataDownloadFilename={dataDownloadFilename}
  //                   />
  //                 </Tab>
  //
  //                 <Tab eventKey={'Networks'} title={'Networks'}>
  //                   <NetworksMetadata networks={allNetworks}/>
  //                 </Tab>
  //
  //               </Tabs>
  //             </Panel.Body>
  //           </Panel>
  //
  //         ]}
  //       />
  //     </Row>
  //   </div>
  // );
}

export default Body;
