import { useEffect } from "react";
import { useStations } from "@/state/query-hooks/use-stations";
import { useVariables } from "@/state/query-hooks/use-variables";
import { useFrequencies } from "@/state/query-hooks/use-frequencies";
import { useNetworks } from "@/state/query-hooks/use-networks";
import { useStationsStore } from "@/state/client/stations-store";
import map from "lodash/fp/map";
import identity from "lodash/fp/identity";

/**
 * Layer 3. Integration between async server state and Zustand client state for preview station variables
 * @param {number} stationId
 * @returns
 */
export const useStationFilteringDefaults = (stationId) => {
  const { data: stations /*isLoading, isError*/ } = useStations();
  const { data: variables /*isLoading, isError*/ } = useVariables();
  const { data: frequencies /*isLoading, isError*/ } = useFrequencies();
  const { data: networks /*isLoading, isError*/ } = useNetworks();
  const {
    setStations,
    setVariables,
    setDefaultNetworks,
    setDefaultVariables,
    setDefaultFrequencies,
    applyDefaultFilter,
  } = useStationsStore((state) => ({
    setStations: state.setStations,
    setVariables: state.setVariables,
    setDefaultNetworks: state.setDefaultNetworks,
    setDefaultVariables: state.setDefaultVariables,
    setDefaultFrequencies: state.setDefaultFrequencies,
    applyDefaultFilter: state.applyDefaultFilter,
    applyAreaFilter: state.applyAreaFilter,
  }));

  useEffect(() => {
    // default setters are guarded against multiple sets, so this is safe to apply on each
    // network request completion
    if (variables)
      setDefaultVariables(map((variable) => variable.id)(variables));
    if (networks) setDefaultNetworks(map((network) => network.uri)(networks));
    if (frequencies) setDefaultFrequencies(map(identity)(frequencies));

    // stations tends to load last, defer applying of the filter until it lands,
    // but allow setting of the selectors above as early as possible
    if (stations && variables && networks && frequencies) {
      setStations(stations);
      setVariables(variables);
      // select everything by default.)
      applyDefaultFilter();
    }
  }, [stations, variables, networks, frequencies]);

  return { stations, variables };
};
