import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useVariables } from "@/state/query-hooks/use-variables";
import { useFrequencies } from "@/state/query-hooks/use-frequencies";
import { useNetworks } from "@/state/query-hooks/use-networks";
import { useStationsStore } from "@/state/client/stations-store";
import map from "lodash/fp/map";
import identity from "lodash/fp/identity";

/**
 * Integration between query hooks loaded on the Body route and setting of defaults for filters.
 * @returns
 */
export const useStationFilteringDefaults = () => {
  const { data: variables } = useVariables();
  const { data: frequencies } = useFrequencies();
  const { data: networks } = useNetworks();
  const { setDefaultNetworks, setDefaultVariables, setDefaultFrequencies } =
    useStationsStore(
      useShallow((state) => ({
        setDefaultNetworks: state.setDefaultNetworks,
        setDefaultVariables: state.setDefaultVariables,
        setDefaultFrequencies: state.setDefaultFrequencies,
      })),
    );

  useEffect(() => {
    // default setters are guarded against multiple sets, so this is safe to apply on each
    // network request completion
    if (variables)
      setDefaultVariables(map((variable) => variable.id)(variables));
    if (networks) setDefaultNetworks(map((network) => network.uri)(networks));
    if (frequencies) setDefaultFrequencies(map(identity)(frequencies));
  }, [variables, networks, frequencies]);
};
