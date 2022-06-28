import React from 'react';
import { createRoot } from 'react-dom/client';
import FrequencySelector from '../FrequencySelector';
import noop from 'lodash/noop';

// TODO: Use better test data.
const allStations = [
    {
        "histories": [
            {
                "country": null,
                "edate": null,
                "elevation": 1430.0,
                "freq": "hourly",
                "id": 33,
                "lat": 60.5992,
                "lon": -136.208,
                "province": "YT",
                "sdate": null,
                "station_name": "Kusawa",
                "tz_offset": null,
                "uri": "/histories/33",
                "variable_uris": []
            }
        ],
        "id": 37,
        "max_obs_time": null,
        "min_obs_time": null,
        "native_id": "YPKU",
        "network_uri": "/networks/8",
        "uri": "/stations/37"
    },
    {
        "histories": [
            {
                "country": null,
                "edate": null,
                "elevation": 1034.0,
                "freq": "hourly",
                "id": 34,
                "lat": 64.5045,
                "lon": -138.219,
                "province": "YT",
                "sdate": null,
                "station_name": "Tombstone Interpretive",
                "tz_offset": null,
                "uri": "/histories/34",
                "variable_uris": [
                    "/variables/52",
                    "/variables/53",
                    "/variables/54",
                    "/variables/55",
                    "/variables/56",
                    "/variables/57",
                    "/variables/58"
                ]
            }
        ],
        "id": 38,
        "max_obs_time": null,
        "min_obs_time": null,
        "native_id": "YPTI",
        "network_uri": "/networks/8",
        "uri": "/stations/38"
    },
];

it('renders without crashing', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    root.render(
      <FrequencySelector
        allStations={allStations}
        onReady={noop}
        onChange={noop}
        value={[]}
      />
    );
});

