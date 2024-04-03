import { makeURI } from "./uri";
import assignAll from "lodash/fp/assignAll";
import capitalize from "lodash/fp/capitalize";
import flow from "lodash/fp/flow";
import get from "lodash/fp/get";
import join from "lodash/fp/join";
import map from "lodash/fp/map";
import padCharsStart from "lodash/fp/padCharsStart";
import uniq from "lodash/fp/uniq";
import { geoJSON2WKT } from "./geographic-encodings";

const pad2 = padCharsStart("0", 2);

export const date2pdpFormat = (date) =>
  date
    ? `${date.getFullYear()}/${pad2(date.getMonth() + 1)}/${pad2(date.getDate())}`
    : "";

const allToNone = (allOptions) => (options) =>
  options.length === allOptions.length ? [] : options;

export const networkUrlToNetwork = (networks) => (uri) =>
  networks.find((network) => network.uri === uri);

export const networkUris2pdpFormat = (networks) =>
  flow(
    allToNone(networks),
    map(networkUrlToNetwork(networks)),
    map("name"),
    join(","),
  );

// This function maps a variable item (as returned by the SDP backend
// `/variables` endpoint) to the representation used by the PDP data download
// backend for identifying variables. A variable identifier is formed by
// concatenating (without separator) the attribute `standard_name` and the
// string derived from attribute `cell_method` by replacing all occurrences
// of the string 'time: ' with '_'. It is unknown at the date of this
// writing why this replacement is performed. For reference, see PDP backend
// module `pdp_util.filters` and CRMP database view `collapsed_vars_v`,
// column `vars`.
export const variable2PdpVariableIdentifier = (v) => {
  if (!v.standard_name) {
    console.log("### variable2PdpVariableIdentifier: null standard_name", v);
  }
  return (
    v.standard_name +
    (v.cell_method ? v.cell_method.replace(/time: /g, "_") : "")
  );
};
export const variablesIdsToVariables = (variables) => (variableId) =>
  variables.find((variable) => variable.id === variableId);

// Map an array of variable ids to an array of representations of those
// variables for the PDP backend.
export const variableIds2pdpFormats = (variables) =>
  flow(
    allToNone(variables),
    map(variablesIdsToVariables(variables)),
    map(variable2PdpVariableIdentifier),
    uniq,
    join(","),
  );

export const frequencies2pdpFormat = (frequencies) =>
  flow(allToNone(frequencies), join(","));

export const dataDownloadTarget = ({
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
}) =>
  makeURI(
    `${config.pdpDataUrl}/pcds/agg/`,
    assignAll([
      {
        "from-date": date2pdpFormat(startDate),
        "to-date": date2pdpFormat(endDate),
        "network-name":
          networkUris2pdpFormat(allNetworks)(selectedNetworksUris),
        "input-vars":
          variableIds2pdpFormats(allVariables)(selectedVariablesIds),
        "input-freq":
          frequencies2pdpFormat(allFrequencies)(selectedFrequencies),
        "input-polygon": geoJSON2WKT(polygon),
        "only-with-climatology": onlyWithClimatology
          ? "only-with-climatology"
          : "",
        [`download-${dataCategory}`]: capitalize(dataCategory),
        "data-format": get("value")(dataFormat),
      },
      clipToDate && { cliptodate: "cliptodate" },
    ]),
  );

// // This is a higher-order function that returns a function that constructs
// // data download URLs suitable for consumption by the PDP dataservice.
// // It is curried like this because of when and where the various parameters
// // are available in the calling code.
// export const dataDownloadUrl =
//   ({ config, filterValues, polygon }) =>
//   ({ dataCategory, clipToDate, fileFormat }) => {
//     // Check whether state has settled. Each selector calls an onReady callback
//     // to export information (e.g., all its options) that it has set up
//     // internally. In retrospect, this is a too-clever solution to the problem
//     // of passing a pile of props around, but it's what we've got.
//     if (
//       !filterValues.networkActions ||
//       !filterValues.variableActions ||
//       !filterValues.frequencyActions
//     ) {
//       return "#";
//     }

//     return dataDownloadTarget({
//       config,
//       ...filterValues,
//       allNetworksOptions: filterValues.networkActions.getAllOptions(),
//       allVariablesOptions: filterValues.variableActions.getAllOptions(),
//       allFrequenciesOptions: filterValues.frequencyActions.getAllOptions(),
//       polygon,
//       dataCategory,
//       clipToDate,
//       dataFormat: fileFormat,
//     });
//   };

export const dataDownloadFilename = ({ dataCategory, fileFormat }) => {
  return `${dataCategory}.${get("value", fileFormat)}`;
};
