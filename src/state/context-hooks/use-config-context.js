import React, { useContext } from "react";

export const ConfigContext = React.createContext(null);

export const useConfigContext = () => {
  return useContext(ConfigContext);
};

export default useConfigContext;
