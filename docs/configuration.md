# Configuration

Main configuration of the Station Data Portal frontend is done via
environment variables.

In a Create React App app, [environment variables are managed carefully](https://facebook.github.io/create-react-app/docs/adding-custom-environment-variables).
Therefore, most of the environment variables below begin with `REACT_APP_`,
as required by CRA.

CRA also provides a convenient system for setting default values of
environment variables in various contexts (development, production, etc.).
(However, these are not how environment variables are configured for
Docker deployments -- for production, for example.)

Brief summary:

* `.env`: Global default settings
* `.env.development`: Development-specific settings (`npm start`)
* `.env.production`: Production-specific settings (`npm run build`)

For more details, see the
[CRA documentation](https://facebook.github.io/create-react-app/docs/adding-custom-environment-variables).

Environment variables for configuring the app are:

`PUBLIC_URL`
- Base URL for Station Data Portal frontend.
- For production, set this to the URL configured in our proxy server.

`REACT_APP_VERSION`
- Current version of the app.
- This value should be set using `generate-commitish.sh` when the Docker image is built.
- It is not recommended to manually override the automatically generated value when the image is run.
- No default value for this variable is provided in any `.env` file.

`REACT_APP_SDS_URL`
- URL for station data portal backend (Station Data Service; SDS).

`REACT_APP_PDP_DATA_URL`
- URL for PDP PCDS data download service.

`REACT_APP_BASE_MAP`
- Selects which base map (and thus which projection) to use for station
  map. Valid values:
    - `BC`: BC OSM Lite (or similar) base map; BC Albers projection.
    - `YNWT`: YNWT OSM Lite (or similar) base map; Yukon Albers projection.

`REACT_APP_BC_BASE_MAP_TILES_URL`
- URL template (includes x, y, z) for BC base map tiles.
- Required only if `REACT_APP_BASE_MAP=BC`

`REACT_APP_YNWT_BASE_MAP_TILES_URL`
- URL template (includes x, y, z) for YNWT base map tiles.
- Required only if `REACT_APP_BASE_MAP=YNWT`

