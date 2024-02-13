import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import urljoin from "url-join";
import { useConfig } from "./use-config";

export const VARIABLES_QUERY_KEY = ["variables"];

const getVariables = async ({ config }) => {
  const { data } = await axios(urljoin(config.sdsUrl, "variables"), {
    params: {
      provinces: config.stationsQpProvinces,
    },
  });
  return data;
};

export const useVariables = () => {
  const { data: config } = useConfig();
  return useQuery({
    queryKey: VARIABLES_QUERY_KEY,
    queryFn: () => getVariables({ config }),
    enabled: !!config,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};

export default useVariables;
