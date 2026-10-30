import { useMemo, useCallback } from "react";
import { useTable, useFilters } from "react-table";
import { useStationsStore } from "@/state/client/stations-store";
import { smtColumnInfo, smtData } from "@/components/info/column-definitions";

// Use the table's own accessors and filters so map matches cannot drift from it.
export function useMetadataStationFilter(stations, networks, variables) {
  const compact = useStationsStore((state) => state.metadataCompact);
  const filters = useStationsStore(
    (state) => state.metadataFilters[compact ? "station" : "history"],
  );
  const columnInfo = useMemo(
    () =>
      smtColumnInfo({
        allNetworks: networks,
        allVariables: variables,
        compact,
      }),
    [networks, variables, compact],
  );
  // The map needs only the active predicates, not every display accessor.
  // In particular, grouping alone must not rebuild variable/name/location
  // cells for every history when there are no attribute filters to apply.
  const columns = useMemo(() => {
    const ids = new Set(filters.map(({ id }) => id));
    return columnInfo.columns.filter(({ id }) => ids.has(id));
  }, [columnInfo.columns, filters]);
  const data = useMemo(
    () => (filters.length ? smtData(stations, compact) : []),
    [stations, compact, filters.length],
  );
  const useControlledState = useCallback(
    (state) => ({ ...state, filters }),
    [filters],
  );
  const { rows } = useTable(
    {
      ...columnInfo,
      columns,
      data,
      autoResetFilters: false,
      useControlledState,
    },
    useFilters,
  );
  return useMemo(() => {
    if (!filters.length) return stations;
    const ids = new Set(
      rows.map(({ original }) => (compact ? original.id : original.station.id)),
    );
    return stations.filter(({ id }) => ids.has(id));
  }, [stations, compact, filters, rows]);
}
