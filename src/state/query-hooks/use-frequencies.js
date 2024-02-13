import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import urljoin from "url-join";
import { useConfig } from "./use-config";

const getFrequencies = async ({ config }) => {
  const { data } = await axios(urljoin(config.sdsUrl, "frequencies"), {
    params: {
      provinces: config.stationsQpProvinces,
    },
  });

  return data;
};

export const FREQUENCIES_QUERY_KEY = ["frequencies"];

export const useFrequencies = () => {
  const { data: config } = useConfig();
  return useQuery({
    queryKey: FREQUENCIES_QUERY_KEY,
    queryFn: () => getFrequencies({ config }),
    enabled: !!config,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};

export default useFrequencies;
