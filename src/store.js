// Create the Zustand store used by this app.

import { create } from 'zustand';
import {
  getFrequencies,
  getNetworks, getStations,
  getVariables
} from './data-services/station-data-service';

export const useStore = create(set => ({
  networks: null,
  variables: null,
  frequencies: null,
  stations: null,

  getMetadata: async appConfig => {
    // TODO: Wrap in useEffect? No: Do that when calling it from a component.
    // TODO: Parallelize; I think Promise.allSettled()
    const networks = await getNetworks({ appConfig });
    set({ networks: await networks.data });
    const variables = await getVariables({ appConfig });
    set({ variables: await variables.data });
    const frequencies = await getFrequencies({ appConfig });
    set({ frequencies: await frequencies.data });
    const stations = await getStations({
      appConfig,
      getParams: {
        compact: true,
      }
    });
    set({ stations: await stations.data });
  }
}));