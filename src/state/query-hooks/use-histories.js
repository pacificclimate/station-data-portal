import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import urljoin from "url-join";
import { useConfig } from "./use-config";

export const getHistories = async ({ config }) => {
  const { data } = await axios.get(urljoin(config.sdsUrl, "histories"));

  return data;
};

export const HISTORIES_QUERY_KEY = ["histories"];

export const useHistories = () => {
  const { data: config } = useConfig();
  return useQuery({
    queryKey: HISTORIES_QUERY_KEY,
    queryFn: getHistories({ config }),
    enabled: !!config,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};
