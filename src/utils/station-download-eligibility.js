import { stationAreaFilter, stationFilter } from "./station-filtering";

// Validate the requested set without silently dropping stations or broadening
// its filters. The aggregate catalog applies criteria to the same history row.
export function stationDownloadConflicts(stations, filterValues, variables) {
  const { area, startDate, endDate } = filterValues;
  const matches = (station) =>
    stationFilter({
      filterValues,
      metadata: { stations: [station], variables },
    }).length > 0;
  return stations.flatMap((station) => {
    let reason;
    if (!Number.isSafeInteger(station.id) || station.id <= 0)
      reason = "This station has no valid database ID.";
    else if (!station.histories?.length || !station.network_uri)
      reason =
        "Station metadata is incomplete. Reload the station before downloading.";
    else if (startDate && endDate && startDate > endDate)
      reason = "The start date must be on or before the end date.";
    else if (!filterValues.selectedNetworks.includes(station.network_uri))
      reason = "This station’s network is excluded by the current filters.";
    else if (!stationAreaFilter(area, [station]).length)
      reason =
        "Outside the current drawn area. Clear or redraw the area to download this station.";
    else if (!matches(station))
      reason =
        "This station does not match the current variable, frequency, date or climatology filters.";
    else if (
      !station.histories.some((history) => {
        const oneHistory = { ...station, histories: [history] };
        return (
          matches(oneHistory) &&
          stationAreaFilter(area, [oneHistory]).length > 0
        );
      })
    )
      reason =
        "No single station history matches the area and station filters together.";
    return reason ? [{ station, reason }] : [];
  });
}
