import PropTypes from "prop-types";
import React, { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import pick from "lodash/fp/pick";
import reduce from "lodash/fp/reduce";
import { Table } from "react-bootstrap";
import InfoPopup from "@/components/util/InfoPopup";
import logger from "@/logger";
import { getTimer } from "@/utils/timing";
import { useObservationCounts } from "@/state/query-hooks/use-observation-counts";
import { useStationsStore } from "@/state/client/stations-store";
import { useStationFilteringContext } from "@/state/context-hooks/use-station-filtering-context";

logger.configure({ active: true });
const timer = getTimer("Observation count timing");

// Strips out the time portion of a date used in observation count queries;
// that is far too fine for any likely resolution for those.
function dateToStrForQuery(date) {
  const pad = (v) => String(v).padStart(2, "0");
  return (
    date &&
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  );
}

const totalCounts = timer.timeThis("totalCounts")((counts, stations) =>
  reduce((sum, station) => sum + (counts[station.id] || 0), 0)(stations),
);

function ObservationCounts({ clipToDate }) {
  const { selectedStations: stations } = useStationFilteringContext();
  const { startDate, endDate } = useStationsStore(
    useShallow(pick(["startDate", "endDate"])),
  );
  const { data: countData, isLoading } = useObservationCounts(
    clipToDate ? dateToStrForQuery(startDate) : null,
    clipToDate ? dateToStrForQuery(endDate) : null,
  );

  const loadingMessage = "Loading ...";

  const countTotals = useMemo(() => {
    if (isLoading || countData === null) {
      return { observations: null, climatologies: null };
    }
    const monthlyObservations = totalCounts(
      countData.observationCounts,
      stations,
    );
    const monthlyClimatologies = totalCounts(
      countData.climatologyCounts,
      stations,
    );
    return {
      observations: monthlyObservations,
      climatologies: monthlyClimatologies,
    };
  }, [countData, stations]);

  const timePeriod = clipToDate
    ? `${dateToStrForQuery(startDate)} to ${dateToStrForQuery(endDate)}`
    : "all dates";

  return (
    <Table size="sm">
      <thead>
        <tr>
          <th scope="colgroup" colSpan={2}>
            Summary for selected stations
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Number of stations</th>
          <td className="text-right" style={{ width: "20%" }}>
            {stations.length}
          </td>
        </tr>
        <tr>
          <th scope="row">
            Total observations ({timePeriod}){" "}
            <InfoPopup title="Total observations">
              Observation counts are estimates, and are less accurate for time
              periods of less than a few months.
            </InfoPopup>
          </th>
          <td className="text-right">
            {countTotals.observations?.toLocaleString() ?? loadingMessage}
          </td>
        </tr>
        <tr>
          <th scope="row">Total climatologies (all dates)</th>
          <td className="text-right">
            {countTotals.climatologies?.toLocaleString() ?? loadingMessage}
          </td>
        </tr>
      </tbody>
    </Table>
  );
}

ObservationCounts.propTypes = {
  startDate: PropTypes.object,
  endDate: PropTypes.object,
  stations: PropTypes.array,
};

export default ObservationCounts;
