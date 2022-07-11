// This component performs a number of one-time app initializations.
// It would be nicer to do this in a hook, but this needs to be a consumer
// of the context, and it's easiest to make it component that is rendered
// at the top level of App. Forgive me.
import { useEffect } from 'react';
import L from 'leaflet';
import { setLethargicMapScrolling } from '../../../utils/leaflet-extensions';
import { useConfigContext } from '../ConfigContext';

export default function InitializeApp() {
  const config = useConfigContext();
  useEffect(() => {
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
  }, [config]);
}
