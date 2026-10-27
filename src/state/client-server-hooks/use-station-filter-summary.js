import { useShallow } from "zustand/react/shallow";
import pick from "lodash/fp/pick";
import { useStationsStore } from "@/state/client/stations-store";
import { useNetworks } from "@/state/query-hooks/use-networks";
import { useVariables } from "@/state/query-hooks/use-variables";
import { useFrequencies } from "@/state/query-hooks/use-frequencies";
import {
  stationCriteriaSummary,
  activeAttributeFilters,
} from "@/utils/station-filter-summary";

export function useStationFilterSummary() {
  const state = useStationsStore(
    useShallow(
      pick([
        "selectedNetworks",
        "selectedVariables",
        "selectedFrequencies",
        "startDate",
        "endDate",
        "onlyWithClimatology",
        "includeStationsWithNoObs",
        "area",
        "metadataCompact",
        "metadataFilters",
      ]),
    ),
  );
  const { data: networks } = useNetworks();
  const { data: variables } = useVariables();
  const { data: frequencies } = useFrequencies();
  const criteria = stationCriteriaSummary(state, {
    networks,
    variables,
    frequencies,
  });
  const view = state.metadataCompact ? "station" : "history";
  const otherView = state.metadataCompact ? "history" : "station";
  const attributeCount = activeAttributeFilters(
    state.metadataFilters[view],
  ).length;
  return {
    criteria,
    criteriaCount: criteria.length,
    attributeCount,
    total: criteria.length + attributeCount,
    viewLabel: state.metadataCompact ? "By Station" : "By History",
    otherViewLabel: state.metadataCompact ? "By History" : "By Station",
    otherViewCount: activeAttributeFilters(state.metadataFilters[otherView])
      .length,
  };
}
