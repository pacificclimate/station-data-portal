import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import urljoin from "url-join";
import { useConfigContext } from "@/state/context-hooks/use-config-context";

export const VARIABLES_QUERY_KEY = ["variables"];

const getVariables = async ({ config }) => {
  const { data } = await axios(urljoin(config.sdsUrl, "variables"), {
    params: {
      provinces: config.stationsQpProvinces,
    },
  });
  return data;
};

export const variablesQuery = (config) => ({
  queryKey: VARIABLES_QUERY_KEY,
  queryFn: () => getVariables({ config }),
  enabled: !!config,
  staleTime: 86400000, // 24 hours
});

export const useVariables = () => {
  const config = useConfigContext();
  return useQuery(variablesQuery(config));
};

export default useVariables;
