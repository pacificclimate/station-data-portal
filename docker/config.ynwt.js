// Example environment config for a YNWT based deployment

window.env = {
  PUBLIC_URL: "http://localhost:30503",
  REACT_APP_YNWT_BASE_MAP_TILES_URL:
    "https://services.pacificclimate.org/tiles/yukon-albers-lite/{z}/{x}/{y}.png",
  appTitle: "YNWT Station Data",
  baseMap: "YNWT",

  sdsUrl:
    "https://beehive.pacificclimate.org/met-data-portal-ynwt/api/metadata/",

  // We do not at present need to filter based on province (verify!)
  //stationsQpProvinces: YK,NT
  // We do not at present need to filter networks (verify!)
  //networkFilters: ???

  pdpDataUrl:
    "https://beehive.pacificclimate.org/met-data-portal-ynwt/api/data/",
};
