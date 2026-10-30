// Example environment config for a YNWT based deployment

window.env = {
  PUBLIC_URL: "http://localhost:30503",
  REACT_APP_YNWT_BASE_MAP_TILES_URL:
    "https://services.pacificclimate.org/tiles/yukon-albers-lite/{z}/{x}/{y}.webp",
  REACT_APP_EEZ_GEOJSON_URL:
    "https://beehive.pacificclimate.org/tiles/eez/eez_boundaries_canada_v12.geojson",
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
