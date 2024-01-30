import App from "../components/main/App/App";

import config from "../server-data/config";

export default function Home() {
  console.log(config);
  return <App config={config} />;
}
