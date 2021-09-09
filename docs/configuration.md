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

## Environment variables

`PUBLIC_URL`
- Base URL for Station Data Portal frontend.
- For production, set this to the URL configured in our proxy server.
- Required.

`REACT_APP_VERSION`
- Current version of the app.
- This value should be set using `generate-commitish.sh` when the Docker image is built.
- It is not recommended to manually override the automatically generated value when the image is run.
- No default value for this variable is provided in any `.env` file.

`REACT_APP_SDS_URL`
- URL for station data portal metadata backend (Station Data Service; SDS).
- Required.

`REACT_APP_PDP_DATA_URL`
- URL for PDP PCDS data download service.
- Required.

`REACT_APP_BASE_MAP`
- Selects which base map (and thus which projection) to use for station
  map. Valid values:
    - `BC`: BC OSM Lite (or similar) base map; BC Albers projection.
    - `YNWT`: YNWT OSM Lite (or similar) base map; Yukon Albers projection.
- Required.

`REACT_APP_BC_BASE_MAP_TILES_URL`
- URL template (includes x, y, z) for BC base map tiles.
- Required if `REACT_APP_BASE_MAP=BC`

`REACT_APP_YNWT_BASE_MAP_TILES_URL`
- URL template (includes x, y, z) for YNWT base map tiles.
- Required if `REACT_APP_BASE_MAP=YNWT`

`REACT_APP_DEFAULT_NETWORK_COLOR`
- Default color for networks with unspecified color.
- Default value `#000000`.
- Must be a value accepted by
  [Chroma.js](https://www.npmjs.com/package/chroma-js),
  which includes standard web colour specs (#RRGGBB).
- Required.

`REACT_APP_STATION_FILTERS`
- Semicolon-separated set of filter expressions applied to filter 
  (select) station metadata received from API. (See [Filtering metadata](#filtering-metadata).)
- Optional

`REACT_APP_NETWORK_FILTERS`
- Semicolon-separated set of filter expressions applied to filter  
  (select) network metadata received from API. (See [Filtering metadata](#filtering-metadata).)
- Optional

## Filtering metadata

The app can filter metadata to include only a desired subset of items.  
(For example, station metadata can be filtered to include only 
stations in BC.)

Filtering is configured by setting the appropriate environment variable
to a string containing zero or more semicolon-separated filter expressions. 

### Filter expression

A filter expression takes the form `<path> <op> <value>`, where
- `<path>` is a JS path addressing a property in a metadata object,
- `<op>` is a comparison operator (only =, != supported at the moment),
- `<value>` is any valid JSON expression not containing a semicolon,
- the filter expression components are separated by at least one space.

Example: 
The filter expression `x[0].a = "foo"` filters (selects)
only those metadata items containing a property selected by the path
`x[0].y` with value equal to the string `foo`. For example, this expression
selects the item

```json
{ "x": [ { "a":  "foo" } ], "y": "other" }
```

and deselects the item

```json
{ "x": [ { "a":  "bar" } ], "y": "oh my" }
```

### Set of filter expressions

One or more filter expressions can be used to filter metadata. Each 
expression in the set must be satisfied (evaluate to `true`) in order
to select an item.

A set of filter expressions is specified by separating each filter
expression by a semicolon. For example: 

```
country = "CA";province = "BC"
```

### Extending filtering

At present, filter expressions allow only for equality (`=`) and inequality
(`!=`) operators. The code is structured to make it easy to extend the
comparison operators available.

At present, filtering is only available for networks and stations. It is
easy to extend this to other metadata if desired.
