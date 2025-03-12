window.env = {
  PUBLIC_URL: "http://localhost:30503",
  REACT_APP_BC_BASE_MAP_TILES_URL:
    "https://services.pacificclimate.org/tiles/bc-albers-lite/{z}/{x}/{y}.png",
  appTitle: "BC Station Data - PCDS",
  baseMap: "BC",

  // Uses swarm based dev url by default
  sdsUrl:
    "https://beehive.pacificclimate.org/met-data-portal-pcds/api/metadata/",

  // Currently deployed metadata backends do not respond to provinces QP.
  // When they do, we can invert the commenting out below.
  //stationsQpProvinces: BC
  stationFilters: 'histories[0].province = "BC"',

  // Always necessary for CRMP database
  networkFilters: 'name != "PCIC Climate Variables"',

  pdpDataUrl:
    "https://beehive.pacificclimate.org/met-data-portal-pcds/api/data/",
};
