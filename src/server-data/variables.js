import urljoin from "url-join";
import config from "../server-data/config";

const getVariables = async () => {
  const res = await fetch(urljoin(config.sdsUrl, "variables"), {
    params: {
      provinces: config.stationsQpProvinces,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch variables: ${res.statusText}`);
  }

  return res.json();
};

export const variables = await getVariables();

export default variables;
