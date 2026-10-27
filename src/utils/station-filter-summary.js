import { textAttributeIds, textFilterTerms } from "./text-filter-terms";
// Count controls that differ from their initial "all / unrestricted" settings.
const hasSubset = (selected, available) => {
  if (!available) return false;
  const values = new Set(selected);
  const options = new Set(available);
  return (
    values.size !== options.size ||
    [...options].some((value) => !values.has(value))
  );
};

export const activeAttributeFilters = (filters) =>
  filters.filter(({ id, value }) => {
    if (textAttributeIds.has(id)) return textFilterTerms(value).length > 0;
    return Array.isArray(value)
      ? value.some(
          (bound) => typeof bound === "number" && Number.isFinite(bound),
        )
      : typeof value === "string"
        ? value.trim() !== "" && value !== "*"
        : typeof value === "number" && Number.isFinite(value);
  });

export function stationCriteriaSummary(
  state,
  { networks, variables, frequencies },
) {
  const criteria = [];
  if (
    hasSubset(
      state.selectedNetworks.filter(
        (uri) =>
          !networks?.some(
            (network) => network.uri === uri && network.publish === false,
          ),
      ),
      networks
        ?.filter(({ publish }) => publish !== false)
        .map(({ uri }) => uri),
    )
  )
    criteria.push("Networks");
  if (
    hasSubset(
      state.selectedVariables,
      variables?.map(({ id }) => id),
    )
  )
    criteria.push("Variables");
  if (hasSubset(state.selectedFrequencies, frequencies))
    criteria.push("Observation frequency");
  if (state.startDate) criteria.push("Start date");
  if (state.endDate) criteria.push("End date");
  if (state.onlyWithClimatology) criteria.push("Only with climatology");
  if (state.includeStationsWithNoObs)
    criteria.push("Include stations with no observations");
  if (state.area?.coordinates?.length) criteria.push("Spatial area");
  return criteria;
}
