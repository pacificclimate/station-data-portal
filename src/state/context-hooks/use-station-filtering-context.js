import React, { useContext } from "react";

export const StationFilteringContext = React.createContext(null);

export const useStationFilteringContext = () => {
  return useContext(StationFilteringContext);
};

export default useStationFilteringContext;
