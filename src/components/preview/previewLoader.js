import { stationVariablesQuery } from "@/state/query-hooks/use-station-variables";
import { stationQuery } from "@/state/query-hooks/use-station";
import { configQuery } from "@/state/query-hooks/use-config";

export const previewLoader =
  (queryClient) =>
  async ({ params }) => {
    const stationId = params.stationId;
    const config = await queryClient.ensureQueryData(configQuery());
    queryClient.ensureQueryData(stationQuery(config, stationId));
    queryClient.ensureQueryData(stationVariablesQuery(config, stationId));

    return { stationId };
  };

export default previewLoader;
