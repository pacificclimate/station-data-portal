// Example environment config for a YNWT based deployment

window.env = {
  PUBLIC_URL: "http://localhost:30503",
  REACT_APP_YNWT_BASE_MAP_TILES_URL:
    "https://services.pacificclimate.org/tiles/yukon-albers-lite/{z}/{x}/{y}.png",
  appTitle: "YNWT Station Data",
  baseMap: "YNWT",

  // sdsUrl values will be replaced by prod URLs when they become ready.
  // For now, we have a dev instance.
  // Uses monsoon database
  sdsUrl:
    "https://beehive.pacificclimate.org/station-data-portal/ynwt/metadata/",

  // We do not at present need to filter based on province (verify!)
  //stationsQpProvinces: YK,NT
  // We do not at present need to filter networks (verify!)
  //networkFilters: ???

  // pdpDataUrl values will be replaced by prod URLs when they become ready.
  // For now, we have a dev instance.
  // Uses monsoon database
  pdpDataUrl:
    "https://beehive.pacificclimate.org/station-data-portal/ynwt/data/",
};
