// This module provides a React context for app configuration values,
// a hook for fetching its value from a YAML file in the public folder ,
// and a hook for using the context value in a functional component.
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import yaml from "js-yaml";


// The context
const ConfigContext = React.createContext({});
export default ConfigContext;


// Custom hook for fetching configuration from public/config.yaml. The result
// is put in a state variable, which the only return of this hook. This hook
// should be used only by the top-level component, and the returned state used
// to set the value provided by `ConfigContext.Provider`. See component `App`.
export function useFetchConfigContext(init = null) {
  const [config, setConfig] = useState(init);
  useEffect(() => {
    axios.get(`${process.env.PUBLIC_URL}/config.yaml`).then(response => {
      const cfg = yaml.load(response.data);

      // Extend loaded config with some computed goodies
      cfg.stationDebugFetchLimitsOptions = cfg.stationDebugFetchLimits.map(
        value => ({ value, label: value.toString() })
      );

      cfg.zoomToMarkerRadius = zoom => {
        const spec = cfg.zoomToMarkerRadiusSpec;
        for (const [_zoom, radius] of spec) {
          if (zoom <= _zoom) {
            return radius;
          }
        }
        return spec[spec.length-1][1];
      }

      // Update the config state.
      setConfig(cfg);
    })
  }, []);
  return config;
}


// Custom hook to make it slightly simpler to access the config context from a
// client component.
export function useConfigContext() {
  return useContext(ConfigContext);
}
