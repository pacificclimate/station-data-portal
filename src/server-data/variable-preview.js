import axios from "axios";
import urljoin from "url-join";

export const getVariablePreview = ({
  stationId,
  endDate,
  startDate,
  variableId,
}) =>
  axios.get(
    urljoin(process.env.PUBLIC_URL, `/pv-${stationId}-${variableId}.json`),
  );
