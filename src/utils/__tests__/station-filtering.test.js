import identity from "lodash/fp/identity";
import includes from "lodash/fp/includes";
import some from "lodash/fp/some";
import filter from "lodash/fp/filter";
import flatten from "lodash/fp/flatten";
import flow from "lodash/fp/flow";
import groupBy from "lodash/fp/groupBy";
import {
  stationMatchesDates,
  stationInAnyNetwork,
  stationReportsSomeVariables,
  stationReportsAnyFreqs,
  stationReportsClimatologyVariable,
  climatologyVairableIdsFromVariables,
  stationFilter,
  stationAreaFilter,
} from "../station-filtering";

import stations from "../__test_data__/stations-bc.json";
import networks from "../__test_data__/networks-bc.json";
import variables from "../__test_data__/variables-bc.json";
import frequencies from "../__test_data__/frequencies-bc.json";
import polygons from "../__test_data__/polygons-bc.json";

const ACTIVE_PASS_STATION = stations[0];
const HOPE_AIRPORT_STATION = stations.filter(
  (station) => station.id === 1588,
)[0];
const MORPHEE_5700_STATION = stations.filter(
  (station) => station.id === 6122,
)[0];
const SPECTACLE_LK_STATION = stations.filter(
  (station) => station.id === 3359,
)[0];

const networksAsUris = (n) => n.uri;
const variablesAsIds = (v) => v.id;

const tempSelector = flow(
  groupBy("display_name"),
  filter(
    some(
      (item) =>
        includes("temperature", item.short_name) &&
        !includes("dew_point", item.short_name),
    ),
  ),
  flatten,
);

const ardaNetworkUri = networks.filter((n) => n.id === 17).map(networksAsUris);

const allNetworksUris = networks.map(networksAsUris);
const allVariableIds = variables.map(variablesAsIds);
const tempVariableIds = tempSelector(variables).map(variablesAsIds);
const allFrequencies = frequencies.map(identity);
const fqHourlyDaily = frequencies.filter(
  (f) => f === "1-hourly" || f === "daily",
);
const climatologyVariableIds = climatologyVairableIdsFromVariables(variables);

describe("Station Filter:", () => {
  test.concurrent.each`
    startDate       | endDate         | expected
    ${"2000-01-01"} | ${"2000-01-02"} | ${true}
    ${"2001-01-01"} | ${"2001-01-02"} | ${false}
  `(
    "stationMatchesDates Filters: $startDate, $endDate = $expected",
    async ({ startDate, endDate, expected }) => {
      const result = stationMatchesDates(
        ACTIVE_PASS_STATION,
        startDate,
        endDate,
        false,
      );
      expect(result).toBe(expected);
    },
  );

  test.concurrent.each`
    station                 | networks                | expected
    ${ACTIVE_PASS_STATION}  | ${allNetworksUris}      | ${true}
    ${ACTIVE_PASS_STATION}  | ${[allNetworksUris[0]]} | ${false}
    ${ACTIVE_PASS_STATION}  | ${[allNetworksUris[3]]} | ${true}
    ${ACTIVE_PASS_STATION}  | ${[]}                   | ${false}
    ${ACTIVE_PASS_STATION}  | ${ardaNetworkUri}       | ${false}
    ${SPECTACLE_LK_STATION} | ${ardaNetworkUri}       | ${true}
    ${SPECTACLE_LK_STATION} | ${allNetworksUris}      | ${true}
    ${SPECTACLE_LK_STATION} | ${[]}                   | ${false}
  `(
    "stationInAnyNetwork filters $expected",
    async ({ station, networks, expected }) => {
      const result = stationInAnyNetwork(station, networks);
      expect(result).toBe(expected);
    },
  );

  test.concurrent.each`
    station                 | variables         | includeStationsWithNoObs | expected
    ${ACTIVE_PASS_STATION}  | ${allVariableIds} | ${false}                 | ${true}
    ${ACTIVE_PASS_STATION}  | ${[429]}          | ${false}                 | ${true}
    ${ACTIVE_PASS_STATION}  | ${[250, 260, 270]}| ${false}                 | ${false}
    ${ACTIVE_PASS_STATION}  | ${[430, 260, 270]}| ${false}                 | ${true}
    ${ACTIVE_PASS_STATION}  | ${[]}             | ${false}                 | ${false}
    ${HOPE_AIRPORT_STATION} | ${[250, 260, 270]}| ${false}                 | ${false}
    ${HOPE_AIRPORT_STATION} | ${[250, 260, 270]}| ${true}                  | ${true}

  `(
    "stationReportsSomeVariables filters station $station.id should match $variables expecting $expected ",
    async ({ station, variables, includeStationsWithNoObs, expected }) => {
      const result = stationReportsSomeVariables(
        station,
        variables,
        includeStationsWithNoObs,
      );
      expect(result).toBe(expected);
    },
  );

  test.concurrent.each`
    station                 | frequencies            | includeStationsWithNoObs | expected
    ${ACTIVE_PASS_STATION}  | ${["hourly"]}          | ${false}                 | ${false}
    ${ACTIVE_PASS_STATION}  | ${["daily"]}           | ${false}                 | ${true}
    ${ACTIVE_PASS_STATION}  | ${["hourly", "daily"]} | ${false}                 | ${true}
    ${ACTIVE_PASS_STATION}  | ${[]}                  | ${false}                 | ${false}
    ${ACTIVE_PASS_STATION}  | ${frequencies}         | ${false}                 | ${true}
    ${HOPE_AIRPORT_STATION} | ${["1-hourly"]}        | ${false}                 | ${true}
    ${HOPE_AIRPORT_STATION} | ${[]}                  | ${true}                  | ${true}
  `(
    "stationReportsAnyFreqs filters: $station.id should match $frequencies expecting $expected",
    async ({ station, frequencies, includeStationsWithNoObs, expected }) => {
      const result = stationReportsAnyFreqs(
        station,
        frequencies,
        includeStationsWithNoObs,
      );
      expect(result).toBe(expected);
    },
  );

  test.concurrent.each`
    station                 | expected
    ${ACTIVE_PASS_STATION}  | ${true}
    ${HOPE_AIRPORT_STATION} | ${false}
    ${MORPHEE_5700_STATION} | ${false}
  `(
    "stationReportsClimatologyVariable filters: $station.id expects $expected",
    ({ station, expected }) => {
      const result = stationReportsClimatologyVariable(
        station,
        climatologyVariableIds,
      );
      expect(result).toBe(expected);
    },
  );

  // Note: These tests are a little weak as they rely only on the number of stations after filtering.
  // Strong tests would use the actual data, but that would be a lot of work to set up.
  // As a result however, these numbers are correct as of 2022-02-27 when the station data was retrieved but
  // may not match in the UI as more stations are added or changed.
  test.concurrent.each`
    stations    | startDate       | endDate         | networks           | selVariables       | frequencys        | includeNoObs | onlyWithClimatology | expected
    ${stations} | ${null}         | ${null}         | ${allNetworksUris} | ${allVariableIds}  | ${allFrequencies} | ${true}      | ${false}            | ${7129} // no filters applied
    ${stations} | ${null}         | ${null}         | ${ardaNetworkUri}  | ${allVariableIds}  | ${allFrequencies} | ${true}      | ${false}            | ${3185} // arda network
    ${stations} | ${null}         | ${null}         | ${allNetworksUris} | ${allVariableIds}  | ${allFrequencies} | ${true}      | ${true}             | ${1751} // stations with climateologies
    ${stations} | ${null}         | ${null}         | ${ardaNetworkUri}  | ${allVariableIds}  | ${allFrequencies} | ${true}      | ${true}             | ${0}    // arda stations with climatologies
    ${stations} | ${null}         | ${null}         | ${allNetworksUris} | ${tempVariableIds} | ${allFrequencies} | ${true}      | ${false}            | ${4701} // temperature variables
    ${stations} | ${null}         | ${null}         | ${ardaNetworkUri}  | ${tempVariableIds} | ${allFrequencies} | ${true}      | ${false}            | ${1339} // arda stations with temperature variables
    ${stations} | ${"2024-02-01"} | ${"2024-02-01"} | ${allNetworksUris} | ${allVariableIds}  | ${allFrequencies} | ${true}      | ${false}            | ${858}  // this month range
    ${stations} | ${"1999-02-01"} | ${"2024-02-01"} | ${allNetworksUris} | ${allVariableIds}  | ${allFrequencies} | ${true}      | ${false}            | ${3102} // from 1999 to now
    ${stations} | ${"1999-02-01"} | ${"2024-02-01"} | ${allNetworksUris} | ${tempVariableIds} | ${allFrequencies} | ${true}      | ${false}            | ${2758} // from 1999 to now with temperatures
    ${stations} | ${null}         | ${null}         | ${allNetworksUris} | ${allVariableIds}  | ${fqHourlyDaily}  | ${true}      | ${false}            | ${4556} // hourly or daily frequencies
    ${stations} | ${null}         | ${null}         | ${ardaNetworkUri}  | ${allVariableIds}  | ${fqHourlyDaily}  | ${true}      | ${false}            | ${1401} // arda hourly or daily frequencies
    ${stations} | ${null}         | ${null}         | ${ardaNetworkUri}  | ${tempVariableIds} | ${fqHourlyDaily}  | ${true}      | ${false}            | ${1339} // arda hourly or daily frequencies with temperature variables
    ${stations} | ${null}         | ${null}         | ${allNetworksUris} | ${allVariableIds}  | ${allFrequencies} | ${false}     | ${false}            | ${7064} // remove no observations
    `(
    "stationFilter filters stations",
    async ({
      stations,
      startDate,
      endDate,
      networks,
      selVariables,
      frequencys,
      includeNoObs,
      onlyWithClimatology,
      expected,
    }) => {
      const result = stationFilter({
        filterValues: {
          includeStationsWithNoObs: includeNoObs,
          startDate,
          endDate,
          selectedNetworks: networks,
          selectedVariables: selVariables,
          selectedFrequencies: frequencys,
          onlyWithClimatology,
        },
        metadata: {
          stations,
          variables,
        },
      });
      expect(result.length).toEqual(expected);
    },
  );

  const bcI = polygons["bc-interior"];
  const bcAndI = polygons["bc-interior-and-island"];
  const ardaStations = stationFilter({
    filterValues: {
      includeStationsWithNoObs: true,
      startDate: null,
      endDate: null,
      selectedNetworks: ardaNetworkUri,
      selectedVariables: allVariableIds,
      selectedFrequencies: allFrequencies,
      onlyWithClimatology: false,
    },
    metadata: {
      stations,
      variables,
    },
  });

  // Note: as with previous test we're matching against expected counts not full data.
  test.concurrent.each`
    stations        | polygon     | expected
    ${stations}     | ${null}     | ${7129}
    ${stations}     | ${bcI}      | ${938}
    ${stations}     | ${bcAndI}   | ${913}
    ${ardaStations} | ${null}     | ${3185}
    ${ardaStations} | ${bcI}      | ${583}
  `("Apply Filter:  ", async ({ stations, polygon, expected }) => {
    const result = stationAreaFilter(polygon, stations);
    expect(result.length).toEqual(expected);
  });
});
