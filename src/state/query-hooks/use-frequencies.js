import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import urljoin from "url-join";
import { useConfigContext } from "../context-hooks/use-config-context";

const getFrequencies = async ({ config }) => {
  const { data } = await axios(urljoin(config.sdsUrl, "frequencies"), {
    params: {
      provinces: config.stationsQpProvinces,
    },
  });

  return data;
};

export const FREQUENCIES_QUERY_KEY = ["frequencies"];

export const frequenciesQuery = (config) => ({
  queryKey: FREQUENCIES_QUERY_KEY,
  queryFn: () => getFrequencies({ config }),
  enabled: !!config,
  staleTime: 86400000, // 24 hours
});

export const useFrequencies = () => {
  const config = useConfigContext();
  return useQuery(frequenciesQuery(config));
};

export default useFrequencies;
