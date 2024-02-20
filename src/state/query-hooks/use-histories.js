import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import urljoin from "url-join";
import { useConfigContext } from "../context-hooks/use-config-context";

export const getHistories = async ({ config }) => {
  const { data } = await axios.get(urljoin(config.sdsUrl, "histories"));

  return data;
};

export const HISTORIES_QUERY_KEY = ["histories"];

export const historiesQuery = (config) => ({
  queryKey: HISTORIES_QUERY_KEY,
  queryFn: () => getHistories({ config }),
  enabled: !!config,
  staleTime: 86400000, // 24 hours
});

export const useHistories = () => {
  const config = useConfigContext();
  return useQuery(historiesQuery(config));
};
