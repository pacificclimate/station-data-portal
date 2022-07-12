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

The content of environment variables is interpreted into JavaScript objects
in a number of ways: as a string, as a number, as a Boolean value, as a
JSON encoded object. The interpretation (type) of each env var is indicated
by a line item "Type: <type>". The default type is string, in case it is
not specified.

Note: Only JSON objects require quotes around strings.

### Deployment

`PUBLIC_URL`
- Base URL for Station Data Portal frontend.
- Type: string.
- For production, set this to the URL configured in our proxy server.
- Required.

`REACT_APP_APP_VERSION`
- Current version of the app.
- Type: string.
- This value should be set using `generate-commitish.sh` when the Docker image is built.
- It is not recommended to manually override the automatically generated value when the image is run.
- Note doubled `APP`_ in name.

### Dataset config

`REACT_APP_APP_TITLE`
- Title of portal (appears in header)
- Type: string.
- Note doubled `APP`_ in name.

`REACT_APP_SDS_URL`
- URL for station data portal metadata backend (Station Data Service; SDS).
- Type: string.
- Required.

`REACT_APP_PDP_DATA_URL`
- URL for PDP PCDS data download service.
- Type: string.
- Required.

`REACT_APP_BASE_MAP`
- Selects which base map (and thus which projection) to use for station
  map. 
- Type: string.
- Valid values:
    - `BC`: BC OSM Lite (or similar) base map; BC Albers projection.
    - `YNWT`: YNWT OSM Lite (or similar) base map; Yukon Albers projection.
- Required.

### BC (PCDS) dataset config

`REACT_APP_BC_BASE_MAP_TILES_URL`
- URL template (includes x, y, z) for BC base map tiles.
- Type: string.
- Required if `REACT_APP_BASE_MAP=BC`

### YNWT dataset config

`REACT_APP_YNWT_BASE_MAP_TILES_URL`
- URL template (includes x, y, z) for YNWT base map tiles.
- Type: string.
- Required if `REACT_APP_BASE_MAP=YNWT`

### Misc UI config

`REACT_APP_ADJUSTABLE_COLUMN_WIDTHS_DEFAULT`
- Default setting for adjustable column widths (between map and tabs).
- Type: JSON array, length 2.
- Default: `[7, 5]`

`REACT_APP_DEFAULT_TAB`
- Default tab in UI
- Type: string.
- Valid values: Clustering | Filters | Metadata | Data | Networks
- Default: Filters

`REACT_APP_LETHARGY`
- Configuration for Lethargy (tool that improves map behaviour with mouse
  scrolling on Macs).
- Type: JSON object
- Default:
  ```json
  {
    "enabled": true,
    "stability": 7,
    "sensitivity": 50,
    "tolerance": 0.05
  }
  ```
- Properties:
  - `enabled`: Activate Lethargy? Type: JSON Boolean.
  - `stability`: Lethargy param.
  - `sensitivity`: Lethargy param.
  - `tolerance`: Lethargy param.

### User docs link config

`REACT_APP_USER_DOCS`
- Configuration for user docs link (in app header)
- Type: JSON object
- Default: 
  ```json
  {
    "showLink": false,
    "url": "https://data.pacificclimate.org/portal/docs/",
    "text": "User Docs"
  }
  ```
- Properties:
  - `showLink`: Show user docs hyperlink? Don't want to until they are built on PDP. Type: JSON Boolean.
  - `url`: URL for user docs hyperlink. Type: JSON string.
  - `text`: Text for user docs hyperlink. Type: JSON string.

### Metadata request options

`REACT_APP_STATIONS_QP_PROVINCES`
- Sets the `provinces` query parameter in the request sent by the client
to `/stations`.
- Type: string.
- Value: Comma-separated list of province codes (e.g., `BC,AB`)
- Optional.

### Client-side station filtering options

`REACT_APP_STATION_FILTERS`
- Semicolon-separated set of filter expressions applied to filter 
  (select) station metadata received from API. (See [Filtering metadata](#filtering-metadata).)
- Type: string.
- Optional.
- Station filtering may not be required if metadata request options (e.g., 
`REACT_APP_STATIONS_QP_PROVINCES`) are set.

`REACT_APP_NETWORK_FILTERS`
- Semicolon-separated set of filter expressions applied to filter  
  (select) network metadata received from API. (See [Filtering metadata](#filtering-metadata).)
- Type: string.
- Optional.

### Map config

`REACT_APP_DEFAULT_NETWORK_COLOR`
- Default color for networks with unspecified color.
- Type: string.
- Default: `#000000`.
- Must be a value accepted by
  [Chroma.js](https://www.npmjs.com/package/chroma-js),
  which includes standard web colour specs (#RRGGBB).

`REACT_APP_ZOOM_TO_MARKER_RADIUS`
- Specification for zoom to marker radius conversion.
- Type: JSON array.
- List of pairs (length-2 lists) of numbers (ints), which are
  interpreted as a list of pairs of `[zoom, radius]` values. 
  Zoom values must be in ascending order.
- Default `[ [7, 2], [99, 4] ]`

`REACT_APP_MAP_SPINNER`
- Configuration for map spinner.
- Type: JSON
- Default:
  ```json
  {
    "spinner": "Bars",
    "x": "40%",
    "y": "40%",
    "width": "80",
    "stroke": "darkgray",
    "fill": "lightgray"
  }
  ```
- Properties
  - `spinner`: Name of the spinner, one of the 
    [`svg-loaders-react`](https://www.npmjs.com/package/svg-loaders-react) spinners. Type: JSON string.
  - `x`: x-position of spinner on map. Type: JSON string.
  - `y`: y-position of spinner on map. Type: JSON string.
  - `width`: Size of spinner on map. Type: JSON string.
  - `stroke`: Stroke colour of spinner graphic. Type: JSON string.
  - `fill`: Fill colour of spinner graphic. Type: JSON string.
  - For additional info, see
    [`MapSpinner`](https://github.com/pacificclimate/pcic-react-leaflet-components/blob/master/docs/package-contents.md#component-mapspinner).

### Disclaimer dialog config

`REACT_APP_DISCLAIMER`
- Disclaimer dialog configuration.
- Type: JSON. Note: MUST be all on one line. This is awkward.
- Default (formatted on multiple lines; see note above):
  ```json
  {
    "enabled": false,
    "title": "Disclaimer Title",
    "body": "Disclaimer body ...",
    "buttonLabel": "Acknowledge"
  } 
  ```
- Properties:
  - `enabled`
    - Present disclaimer dialog on app startup?
    - Type: JSON Boolean.
  - `title`
    - Title content for disclaimer dialog.
    - Type: JSON string
  - `body`
    - Body content for disclaimer dialog.
    - Type: JSON string
  - `buttonLabel`
    - **Close** button label for disclaimer; recommend some variant of 
    Acknowledge, Accept, ...
    - Type: JSON string

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
