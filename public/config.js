window.env = {
  PUBLIC_URL: "http://localhost:30503",
  REACT_APP_BC_BASE_MAP_TILES_URL:
    "https://swarm.pacificclimate.org/tiles/bc-albers-lite/{z}/{x}/{y}.png",
  REACT_APP_YNWT_BASE_MAP_TILES_URL:
    "https://swarm.pacificclimate.org/tiles/yukon-albers-lite/{z}/{x}/{y}.png",
  appTitle: "BC Station Data - PCDS",
  baseMap: "BC",

  sdsUrl:
    "https://beehive.pacificclimate.org/met-data-portal-pcds/api/metadata/",

  // Currently deployed metadata backends do not respond to provinces QP.
  // When they do, we can use stationsQpProvinces and lose stationFilters
  //stationsQpProvinces: BC
  stationFilters: 'histories[0].province = "BC"',

  // Always necessary for CRMP database
  networkFilters: 'name != "PCIC Climate Variables"',

  pdpDataUrl:
    "https://beehive.pacificclimate.org/met-data-portal-pcds/api/data/",

  // Debug params
  //stationFilters: histories[0].province = "BC"
  //stationDebugFetchOptions: false
  //stationDebugFetchLimits: [100, 500, 1000, 2000, 4000, 8000]
  //stationOffset: undefined
  //stationLimit: undefined
  //stationStride: undefined
  //showReloadStationsButton: false
  //timingEnabled: false

  // Preview Options
  plotColor: "#1f77b4",
  dataRequestDurations: [1, 3, 6, 12], // months
  dataRequestDurationsDefault: 6, // months

  // disclaimer:
  //   enabled: true
  //   title: "Disclaimer"
  //   body: |
  //     The Pacific Climate Impacts Consortium (PCIC), and all monitoring and or funding partners
  //     who provide data or support to PCIC or its partners for this portal, take no responsibility
  //     for the accuracy of this data. Portal users acknowledge that they are using data from the
  //     portal at their own risk.
  //   buttonLabel: "Agree"
};
