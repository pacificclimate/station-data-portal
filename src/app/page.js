import App from "../components/main/App/App";

import config from "../server-data/config";
import frequencies from "../server-data/frequencies";
import histories from "../server-data/histories";
import variables from "../server-data/variables";
import networks from "../server-data/networks";
import stations from "../server-data/stations";

export default function Home() {
  const metaData = {
    config,
    frequencies,
    histories,
    variables,
    networks,
    stations,
  };
  return <App metaData={metaData} />;
}
