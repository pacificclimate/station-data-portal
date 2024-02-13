// This hook performs a number of one-time app initializations.
import { useEffect } from "react";
import L from "leaflet";
import { setLethargicMapScrolling } from "../../../utils/leaflet-extensions";
import { setTimingEnabled } from "../../../utils/timing";
import { useConfig } from "../../../state/query-hooks/use-config";

function initializeApp(config) {
  console.log("### initializeApp", config);
  if (config === null) {
    return;
  }

  // Set browser title
  document.title = config.appTitle;

  // Set up (polygon) drawing tool in Leaflet.
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
}

/**
 * This hook loads the config and initializes the app. Primarily setting up Map, Scrolling behaviour and debug timing.
 *
 * @returns {void}
 */
export default function useInitializeApp() {
  const { data } = useConfig();
  useEffect(() => {
    if (data) {
      initializeApp(data);
    }
  }, [data]);
}
