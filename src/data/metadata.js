import axios from "axios";
import urljoin from "url-join";

export function getObservationCounts({ config, getParams, axiosConfig }) {
  return axios.get(urljoin(config.sdsUrl, "observations", "counts"), {
    params: {
      provinces: config.stationsQpProvinces,
      ...getParams,
    },
    ...axiosConfig,
  });
}
