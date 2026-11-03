import { stationAreaFilter, stationFilter } from "./station-filtering";

function stationDownloadConflict(station, filterValues, matches) {
  const { area, startDate, endDate } = filterValues;
  if (!Number.isSafeInteger(station.id) || station.id <= 0) {
    return "This station has no valid database ID.";
  }
  if (!station.histories?.length || !station.network_uri) {
    return "Station metadata is incomplete. Reload the station before downloading.";
  }
  if (startDate && endDate && startDate > endDate) {
    return "The start date must be on or before the end date.";
  }
  if (!filterValues.selectedNetworks.includes(station.network_uri)) {
    return "This station’s network is excluded by the current filters.";
  }
  if (!stationAreaFilter(area, [station]).length) {
    return "Outside the current drawn area. Clear or redraw the area to download this station.";
  }
  if (!matches(station)) {
    return "This station does not match the current variable, frequency, date or climatology filters.";
  }
  const matchingHistory = station.histories.some((history) => {
    const oneHistory = { ...station, histories: [history] };
    return (
      matches(oneHistory) && stationAreaFilter(area, [oneHistory]).length > 0
    );
  });
  if (!matchingHistory) {
    return "No single station history matches the area and station filters together.";
  }
}

// Validate the requested set without silently dropping stations or broadening
// its filters. The aggregate catalog applies criteria to the same history row.
export function stationDownloadConflicts(stations, filterValues, variables) {
  const matches = (station) =>
    stationFilter({
      filterValues,
      metadata: { stations: [station], variables },
    }).length > 0;
  return stations.flatMap((station) => {
    const reason = stationDownloadConflict(station, filterValues, matches);
    return reason ? [{ station, reason }] : [];
  });
}
