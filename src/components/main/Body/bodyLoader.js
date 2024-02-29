import { useStore } from "@/state/client/state-store";
import { stationsQuery } from "@/state/query-hooks/use-stations";
import { variablesQuery } from "@/state/query-hooks/use-variables";
import { networksQuery } from "@/state/query-hooks/use-networks";
import { frequenciesQuery } from "@/state/query-hooks/use-frequencies";
import { historiesQuery } from "@/state/query-hooks/use-histories";
import { configQuery } from "@/state/query-hooks/use-config";

// loaders exist to get ahead of data loading for the rest of the page. We'll need this, so lets
// kick off fetching as soon as we can. Note that we don't await the results here with the exception
// of config which is needed to load the others.

export const bodyLoader = (queryClient) => async () => {
  const config = await queryClient.ensureQueryData(configQuery());
  const stationsLimit =
    useStore.getState().stationsLimit ?? config.stationsLimit;
  queryClient.ensureQueryData(stationsQuery(config, stationsLimit));
  queryClient.ensureQueryData(variablesQuery(config));
  queryClient.ensureQueryData(networksQuery(config));
  queryClient.ensureQueryData(frequenciesQuery(config));
  queryClient.ensureQueryData(historiesQuery(config));
  return null;
};

export default bodyLoader;
