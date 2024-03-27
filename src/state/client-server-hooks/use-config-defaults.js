import { useEffect } from "react";
import L from "leaflet";
import { setLethargicMapScrolling } from "../../utils/leaflet-extensions";
import { setTimingEnabled } from "../../utils/timing";
import { useConfig } from "../query-hooks/use-config";
import { useStore } from "../client/state-store";

/**
 * This hook runs after config is loaded, used once at the "App" component level to ensure that
 * Defaults are applied
 * @returns {object} results from useConfig hook.
 */
export const useConfigDefaults = () => {
  const { data: config, isLoading, isError } = useConfig();
  const setStationLimit = useStore((state) => state.setStationLimit);

  useEffect(() => {
    if (isLoading || isError || !!config) {
      return;
    }

    // Set browser title
    document.title = config.appTitle;

    // Provide Leaflet defaults.
    L.drawLocal.edit.toolbar.buttons = {
      edit: "Edit shapes",
      editDisabled: "No shapes to edit",
      remove: "Remove shapes",
      removeDisabled: "No shapes to remove",
    };
    L.drawLocal.edit.handlers.remove.tooltip = "Click shape to remove";
    L.drawLocal.edit.toolbar.actions.clearAll = {
      title: "Remove all shapes",
      text: "Remove all",
    };

    // Initialize Lethargy, which fixes scrolling problems with Mac computers.
    if (config.lethargy.enabled) {
      setLethargicMapScrolling(
        config.lethargy.stability,
        config.lethargy.sensitivity,
        config.lethargy.tolerance,
      );
    }

    // Export timing values to non-component code
    setTimingEnabled(config.timingEnabled);

    setStationLimit(config.stationLimit);
  }, [config]);

  return { isLoading, isError, data: config };
};

export default useConfigDefaults;
