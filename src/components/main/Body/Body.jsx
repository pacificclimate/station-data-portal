import logger from "@/logger";
import { StationFilteringProvider } from "./StationFilteringProvider";
import { useStationFilteringDefaults } from "@/state/client-server-hooks/use-station-filtering-defaults";

import { BodyContent } from "./BodyContent";

logger.configure({ active: true });

// This component is kept lean in order to minimize the amount of re-renders that happen
export const Body = () => {
  useStationFilteringDefaults();

  return (
    <StationFilteringProvider>
      <BodyContent />
    </StationFilteringProvider>
  );
};

// Needed for react-router
export const Component = Body;
export default Body;
