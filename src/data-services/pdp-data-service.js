import { makeURI } from '../utils/uri';
import assignAll from 'lodash/fp/assignAll';
import capitalize from 'lodash/fp/capitalize';
import filter from 'lodash/fp/filter';
import flatten from 'lodash/fp/flatten';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';
import join from 'lodash/fp/join';
import map from 'lodash/fp/map';
import padCharsStart from 'lodash/fp/padCharsStart';
import tap from 'lodash/fp/tap';
import uniq from 'lodash/fp/uniq';
import { geoJSON2WKT } from '../utils/geographic-encodings';
import { config } from '../utils/configuration';


const pad2 = padCharsStart('0', 2);

export const date2pdpFormat = date =>
  date ?
    `${date.getFullYear()}/${pad2(date.getMonth()+1)}/${pad2(date.getDate())}` :
    '';


const allToNone = allOptions => options =>
  allOptions && options && (options.length === allOptions.length) ? [] : options;


const networkSelectorOption2pdpFormat = get('value.name');

export const networkSelectorOptions2pdpFormat = (options, allOptions) => flow(
  allToNone(allOptions),
  map(networkSelectorOption2pdpFormat),
  join(','),
)(options);


// This function maps a variable item (as returned by the SDP backend
// `/variables` endpoint) to the representation used by the PDP data download
// backend for identifying variables. A variable identifier is formed by
// concatenating (without separator) the attribute `standard_name` and the
// string derived from attribute `cell_method` by replacing all occurrences
// of the string 'time: ' with '_'. It is unknown at the date of this
// writing why this replacement is performed. For reference, see PDP backend
// module `pdp_util.filters` and CRMP database view `collapsed_vars_v`,
// column `vars`.
export const variable2PdpVariableIdentifier = (v) =>{
  if (!v.standard_name) {
    console.log('### variable2PdpVariableIdentifier: null standard_name', v)
  }
  return v.standard_name +
    (v.cell_method ? v.cell_method.replace(/time: /g, '_') : '');
};
// export const variable2PdpVariableIdentifier = ({ standard_name, cell_method }) =>
//   standard_name + (cell_method ? cell_method.replace(/time: /g, '_') : '');

const variableSelectorOption2pdpFormat = flow(
  // option.contexts is an array of all variables corresponding to this option.
  get('contexts'),
  // Filter out variables that lack required attributes.
  // As far as we know, these variables are erroneous.
  filter('standard_name'),
  map(variable2PdpVariableIdentifier),
);


// Map an array of variable options to an array of representations of those
// variables for the PDP backend.
const variableOptions2pdpFormats = flow(
  map(variableSelectorOption2pdpFormat),
  flatten,
  uniq,
);

const flattenGroupedOptions = flow(
  map('options'),
  flatten,
);

export const variableSelectorOptions2pdpFormat = (options, allOptions) => flow(
  variableOptions2pdpFormats,
  allToNone(variableOptions2pdpFormats(flattenGroupedOptions(allOptions))),
  join(','),
)(options);

const frequencyOption2pdpFormat = get('value');

export const frequencyOptions2pdpFormat = (options, allOptions) => flow(
  map(frequencyOption2pdpFormat),
  allToNone(allOptions),
  join(','),
)(options);


export const dataDownloadTarget = ({
  startDate,
  endDate,
  selectedNetworksOptions,
  selectedVariablesOptions,
  selectedFrequenciesOptions,
  polygon,
  clipToDate,
  onlyWithClimatology,
  dataCategory,
  dataFormat,
  allNetworksOptions = [],
  allVariablesOptions = [],
  allFrequenciesOptions = [],
}) =>
makeURI(
  `${config.pdpDataUrl}/pcds/agg/`,
  assignAll([
    {
      'from-date': date2pdpFormat(startDate),
      'to-date': date2pdpFormat(endDate),
      'network-name': networkSelectorOptions2pdpFormat(
        selectedNetworksOptions, allNetworksOptions
      ),
      'input-vars': variableSelectorOptions2pdpFormat(
        selectedVariablesOptions, allVariablesOptions
      ),
      'input-freq': frequencyOptions2pdpFormat(
        selectedFrequenciesOptions, allFrequenciesOptions
      ),
      'input-polygon': geoJSON2WKT(polygon),
      'only-with-climatology': onlyWithClimatology ? 'only-with-climatology' : '',
      [`download-${dataCategory}`]: capitalize(dataCategory),
      'data-format': get('value')(dataFormat),
    },
    clipToDate && { 'cliptodate': 'cliptodate' },
  ])
);


export const dataDownloadUrl =
  ({ filterValues, polygon }) =>
  ({ dataCategory, clipToDate, fileFormat }) => {
    // Check whether state has settled. Each selector calls an onReady callback
    // to export information (e.g., all its options) that it has set up
    // internally. In retrospect, this is a too-clever solution to the problem
    // of passing a pile of props around, but it's what we've got.
    if (
      !filterValues.networkActions
      || !filterValues.variableActions
      || !filterValues.frequencyActions
    ) {
      return "#";
    }

    return dataDownloadTarget({
      ...filterValues,
      allNetworksOptions: filterValues.networkActions.getAllOptions(),
      allVariablesOptions: filterValues.variableActions.getAllOptions(),
      allFrequenciesOptions: filterValues.frequencyActions.getAllOptions(),
      polygon,
      dataCategory,
      clipToDate,
      dataFormat: fileFormat,
    });
  };


export const dataDownloadFilename = ({ dataCategory, fileFormat }) => {
  return `${{ dataCategory, fileFormat }}.${get('value', fileFormat)}`;
}
