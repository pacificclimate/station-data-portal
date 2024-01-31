import urljoin from "url-join";
import config from "../server-data/config";

export const getHistories = async () => {
  const res = await fetch(urljoin(config.sdsUrl, "histories"));
  if (!res.ok) {
    throw new Error(`Failed to fetch histories: ${res.statusText}`);
  }

  return res.json();
};

export const histories = await getHistories();

export default histories;
