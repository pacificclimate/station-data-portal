import { create } from 'zustand';
import { loadConfigAction } from './action-load-config';


export const useStore = create((set, get) => ({
    // States
    config: null,
    configError: null,
    isConfigLoaded: () => get().config !== null,
    // Actions
    initialize: () => get()._loadConfig(),

    // Private Actions
    _loadConfig: loadConfigAction(set, get)
  }));