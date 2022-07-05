# Configuration

Main configuration of the Station Data Portal frontend is done via
environment variables.

In a Create React App app, [environment variables are managed carefully](https://facebook.github.io/create-react-app/docs/adding-custom-environment-variables).
Therefore, most of the environment variables below begin with `REACT_APP_`,
as required by CRA.

For development runs of the app launched with `npm start`, the files
`.env` and `.env.development` provide environment variable values.
For more details, see the
[CRA documentation](https://facebook.github.io/create-react-app/docs/adding-custom-environment-variables).

For production runs, environment variables are provided by
`docker-compose.yaml`. 

## Environment variables

### Deployment

`PUBLIC_URL`
- Base URL for Station Data Portal frontend.
- For production, set this to the URL configured in our proxy server.
- Required.

`REACT_APP_VERSION`
- Current version of the app.
- This value should be set using `generate-commitish.sh` when the Docker image is built.
- It is not recommended to manually override the automatically generated value when the image is run.
- No default value for this variable is provided in any `.env` file.

### Dataset config

`REACT_APP_TITLE`
- Title of portal (appears in header)

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

### BC (PCDS) dataset config

`REACT_APP_BC_BASE_MAP_TILES_URL`
- URL template (includes x, y, z) for BC base map tiles.
- Required if `REACT_APP_BASE_MAP=BC`

### YNWT dataset config

`REACT_APP_YNWT_BASE_MAP_TILES_URL`
- URL template (includes x, y, z) for YNWT base map tiles.
- Required if `REACT_APP_BASE_MAP=YNWT`

### User docs link config

`REACT_APP_USER_DOCS_SHOW_LINK`
- Show user docs hyperlink? Don't want to until they are built on PDP.
- String rep of boolean.
- Default: false

`REACT_APP_USER_DOCS_URL`
- URL for user docs hyperlink
- Default: https://data.pacificclimate.org/portal/docs/

`REACT_APP_USER_DOCS_TEXT`
- Text for user docs hyperlink
- Default: User Docs

### Default tab

`REACT_APP_DEFAULT_TAB`
- Default tab in UI
- Valid values: Clustering | Filters | Metadata | Data | Networks
- Default: Filters

### Metadata request options

`REACT_APP_STATIONS_QP_PROVINCES`
- Sets the `provinces` query parameter in the request sent by the client
to `/stations`.
- Value: Comma-separated list of province codes (e.g., `BC,AB`)
- Optional.

### Client-side station filtering options

`REACT_APP_STATION_FILTERS`
- Semicolon-separated set of filter expressions applied to filter 
  (select) station metadata received from API. (See [Filtering metadata](#filtering-metadata).)
- Optional.
- Station filtering may not be required if metadata request options (e.g., 
`REACT_APP_STATIONS_QP_PROVINCES`) are set.

`REACT_APP_NETWORK_FILTERS`
- Semicolon-separated set of filter expressions applied to filter  
  (select) network metadata received from API. (See [Filtering metadata](#filtering-metadata).)
- Optional.

### Misc config

`REACT_APP_DEFAULT_NETWORK_COLOR`
- Default color for networks with unspecified color.
- Default value `#000000`.
- Must be a value accepted by
  [Chroma.js](https://www.npmjs.com/package/chroma-js),
  which includes standard web colour specs (#RRGGBB).
- Required.

`REACT_APP_ZOOM_TO_MARKER_RADIUS`
- Specification for zoom to marker radius conversion.
- Semicolon-separated pairs of comma-separated numbers (ints), which are
  interpreted as a list of pairs of `[zoom, radius]` values. Zoom values must
  be in ascending order.
- Optional; default `7,2;99,4` -> `[[7,2], [99,4]]`
- If there is an error in the provided value, the default is used and an error
  message is written to the console.

### Disclaimer dialog config

`REACT_APP_DISCLAIMER_ENABLED`
- Present disclaimer dialog on app startup.
- String representing boolean value; case insensitive "true" === true, else false.
- Optional; default empty === false.

`REACT_APP_DISCLAIMER_TITLE`
- Title content for disclaimer dialog.
- Optional; provide if REACT_APP_DISCLAIMER_ENABLED is true.

`REACT_APP_DISCLAIMER_BODY`
- Body content for disclaimer dialog.
- Optional; provide if REACT_APP_DISCLAIMER_ENABLED is true.

`REACT_APP_DISCLAIMER_BUTTON_LABEL`
- Close-button label for disclaimer; recommend some variant of 
Acknowledge, Accept, ...
- Optional; provide if REACT_APP_DISCLAIMER_ENABLED is true.

`REACT_APP_DEBUG_STATION_FETCH_OPTIONS`
- Add control(s) for setting station fetch debug options (e.g., limit).
- Dev/debug only.
- Case-insensitive string; "true" to turn on.
- Optional, default false.

### Debug/dev config

`REACT_APP_DEBUG_STATION_FETCH_OPTIONS`
- Show/hide station fetch options controls for experimenting.
- Value: string bool
- Default: false

`REACT_APP_MARKER_CLUSTERING_AVAILABLE`
- Allow marker clustering.
- When enabled, enables marker clustering by default and shows marker
clustering control tab.
- Semi dev/debug.
- Case-insensitive string; "true" to turn on.
- Optional, default false.

`REACT_APP_SHOW_RELOAD_STATIONS_BUTTON`
- Show Reload Stations button.
- Dev/debug only.
- Case-insensitive string; "true" to turn on.
- Optional, default false.

`REACT_APP_STATION_OFFSET`
- Sets `offset` param in /stations request. For testing.
- Optional.

`REACT_APP_STATION_LIMIT`
- Sets `limit` param in /stations request. For testing.
- Optional.

`REACT_APP_STATION_STRIDE`
- Sets `stride` param in /stations request. For testing.
- Optional.

`REACT_APP_TIMING_ENABLED`
- Enable timing of selected operations. When enabled, timings are logged to 
console.
- Value: string bool.
- Default: false.

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
