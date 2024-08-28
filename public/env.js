window.env = {
  PUBLIC_URL: "http://localhost:3000",
  REACT_APP_BC_BASE_MAP_TILES_URL:
    "https://swarm.pacificclimate.org/tiles/bc-albers-lite/{z}/{x}/{y}.png",
  REACT_APP_YNWT_BASE_MAP_TILES_URL:
    "https://swarm.pacificclimate.org/tiles/yukon-albers-lite/{z}/{x}/{y}.png",
  appTitle: "BC Station Data - PCDS",
  baseMap: "BC",

  // sdsUrl values will be replaced by dev or prod URLs when they become ready.
  // For now, we have demo instances inside the firewall.
  // Uses monsoon database
  //sdsUrl: http://docker-dev02.pcic.uvic.ca:30512
  // Uses new database
  //sdsUrl: http://docker-dev02.pcic.uvic.ca:30562
  // Local instance
  sdsUrl:
    "https://beehive.pacificclimate.org/station-data-portal/pcds/metadata/",

  // Currently deployed metadata backends do not respond to provinces QP.
  // When they do, we can use stationsQpProvinces and lose stationFilters
  //stationsQpProvinces: BC
  stationFilters: 'histories[0].province = "BC"',

  // Always necessary for CRMP database
  networkFilters: 'name != "PCIC Climate Variables"',

  // pdpDataUrl values will be replaced by dev or prod URLs when they become ready.
  // For now, we have a demo instance inside the firewall, below.
  // Uses monsoon database
  pdpDataUrl:
    "https://beehive.pacificclimate.org/station-data-portal/pcds/data/",
  // Uses new database
  //pdpDataUrl: http://docker-dev02.pcic.uvic.ca:???

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
