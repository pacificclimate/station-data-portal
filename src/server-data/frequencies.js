import urljoin from "url-join";
import config from "../server-data/config";

export const getFrequencies = async () => {
  const res = await fetch(urljoin(config.sdsUrl, "frequencies"), {
    params: {
      provinces: config.stationsQpProvinces,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch frequencies: ${res.statusText}`);
  }

  return res.json();
};

export const frequencies = await getFrequencies();

export default frequencies;
