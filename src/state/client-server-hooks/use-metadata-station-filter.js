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
  const data = useMemo(() => smtData(stations, compact), [stations, compact]);
  const useControlledState = useCallback(
    (state) => ({ ...state, filters }),
    [filters],
  );
  const { rows } = useTable(
    {
      ...columnInfo,
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
