# Configuration

Most configuration of the Station Data Portal frontend is done via a YAML
file, `public/config.js`. For details, see below.

For technical reasons, a few configuration parameters must be supplied via
environment variables.

## Configuration via `public/config.js`

This file must be a key-value map. It overrides the default configuration
values, which are given below. Certain keys do not have default values and
_must_ be specified in `public/config.js`. The others are optional.

### Configuration options

For default values see [Default configuration](#default-configuration).

#### Absolutely required values

These values do not have defaults and must be specified
in `public/config.js`. They are critical to the functioning of the app.

`appTitle`

- Title of portal (appears in header).
- Value: string.
- Required; no default.

`sdsUrl`

- URL for station data portal metadata backend (Station Data Service; SDS).
- Value: string.
- Required; no default.

`pdpDataUrl`

- URL for PDP data download service.
- Value: string.
- Required; no default.

`baseMap`

- Selects which base map (and thus which projection) to use for station
  map.
- Type: string.
- Valid values:
  - `BC`: BC OSM Lite (or similar) base map; BC Albers projection.
  - `YNWT`: YNWT OSM Lite (or similar) base map; Yukon Albers projection.
- Required; no default.

#### Required values with defaults

These values may be overridden, but not with `undefined` or with invalid
value types. Typically, these values configure basic UI functionality.

`adjustableColumnWidthsDefault`

- Default setting for adjustable column widths (between map and tabs).
- Type: array, length 2.
- Required.

`defaultTab`

- Default tab in UI
- Type: string.
- Valid values: Filters | Metadata | Data | Networks
- Required.

`defaultNetworkColor`

- Default color for networks with unspecified color.
- Type: string.
- Valid values: Must be a value accepted by
  [Chroma.js](https://www.npmjs.com/package/chroma-js),
  which includes standard web colour specs (`#RRGGBB`).
- Required.

`zoomToMarkerRadiusSpec`

- Specification for zoom to marker radius conversion.
- Type: array.
- Valid values: List of pairs (length-2 lists) of numbers (ints), which are
  interpreted as a list of pairs of `[zoom, radius]` values.
  Zoom values must be in ascending order.
- Required.

`lethargy`

- Configuration for Lethargy (tool that improves map behaviour with mouse
  scrolling on Macs).
- Type: key-value map
- Properties:
  - `enabled`: Activate Lethargy? Type: Boolean.
  - `stability`: Lethargy param. Type: number.
  - `sensitivity`: Lethargy param. Type: number.
  - `tolerance`: Lethargy param. Type: number.
- Required.

`userDocs`

- Configuration for user docs link (in app header)
- Type: key-value map
- Properties:
  - `showLink`: Show user docs hyperlink? Don't want to until they are built on PDP. Type: Boolean.
  - `url`: URL for user docs hyperlink. Type: string.
  - `text`: Text for user docs hyperlink. Type: string.
- Required.

`mapSpinner`

- Configuration for map spinner.
- Type: key-value map
- Important properties
  - `spinner`: Name of the spinner, one of the
    [`svg-loaders-react`](https://www.npmjs.com/package/svg-loaders-react) spinners. Type: string.
  - `x`: x-position of spinner on map. Type: string.
  - `y`: y-position of spinner on map. Type: string.
  - `width`: Size of spinner on map. Type: string.
  - `stroke`: Stroke colour of spinner graphic. Type: string.
  - `fill`: Fill colour of spinner graphic. Type: string.
  - For additional info, see
    [`MapSpinner`](https://github.com/pacificclimate/pcic-react-leaflet-components/blob/master/docs/package-contents.md#component-mapspinner).
- Required.

`disclaimer`

- Disclaimer dialog configuration.
- Type: key-value map
- Properties:
  - `enabled`: Present disclaimer dialog on app startup? Type: Boolean.
  - `title`: Title content for disclaimer dialog. Type: string
  - `body`: Body content for disclaimer dialog. Type: string
  - `buttonLabel`: Label of **Close** button. Type: string
- Required.

#### Optional values

These values default to `undefined`. They may be overridden with values
of the correct type.

`stationsQpProvinces`

- Sets the `provinces` query parameter in the request sent by the app
  to `/stations`.
- Type: string.
- Valid values: Comma-separated list of province codes (e.g., `BC,AB`)
- Optional.

`stationFilters`

- Semicolon-separated set of filter expressions applied to pre-filter
  (select) station metadata received from API.
  (See [Filtering metadata](#filtering-metadata).)
- Type: string.
- Optional.
- Note: Station filtering may not be required if metadata request options
  (e.g., `stationsQpProvinces`) are set.
- Optional.

`networkFilters`

- Semicolon-separated set of filter expressions applied to filter  
  (select) network metadata received from API. (See [Filtering metadata](#filtering-metadata).)
- Type: string.
- Optional.

`stationDebugFetchOptions`

- Show/hide station fetch options controls for experimenting.
- Value: Boolean
- Optional.

`stationDebugFetchLimits`

- Items for debug fetch dropdown.
- Type: array.
- Optional.

`showReloadStationsButton`

- Show Reload Stations button.
- Type: Boolean.
- Optional.

`stationOffset`

- Sets `offset` param in /stations request. For testing.
- Optional.

`stationLimit`

- Sets `limit` param in /stations request. For testing.
- Optional.

`stationStride`

- Sets `stride` param in /stations request. For testing.
- Optional.

`timingEnabled`

- Enable timing of selected operations. When enabled, timings are logged to
  console.
- Value: Boolean.
- Optional.

### Default configuration

```yaml
{
  "adjustableColumnWidthsDefault": [7, 5],
  "defaultTab": "Filters",
  "defaultNetworkColor": "#000000",
  "zoomToMarkerRadiusSpec": [[7, 2], [99, 4]],
  "userDocs":
    {
      "showLink": false,
      "url": "https://data.pacificclimate.org/portal/docs/",
      "text": "User Docs",
    },
  "lethargy":
    { "enabled": true, "stability": 7, "sensitivity": 50, "tolerance": 0.05 },
  "disclaimer":
    {
      "enabled": false,
      "title": "Disclaimer Title",
      "body": "Disclaimer body ...",
      "buttonLabel": "Acknowledge",
    },
  "mapSpinner":
    {
      "spinner": "Bars",
      "x": "40%",
      "y": "40%",
      "width": "80",
      "stroke": "darkgray",
      "fill": "lightgray",
    },
  "stationDebugFetchOptions": false,
  "stationDebugFetchLimits": [100, 500, 1000, 2000, 4000, 8000],
  "showReloadStationsButton": false,
  "timingEnabled": false,
}
```

### Example custom configuration files

#### Default configuration

Currently targets CRMP database.

```js
window.env = {
  appTitle: "BC Station Data - PCDS",
  baseMap: "BC",
  // Uses development database
  sdsUrl:
    "https://beehive.pacificclimate.org/station-data-portal/pcds/metadata",
  //sdsUrl: http://localhost:5000,
  // Currently deployed metadata backends do not respond to provinces QP.
  // When they do, we can use stationsQpProvinces and lose stationFilters
  //stationsQpProvinces: "BC",
  stationFilters: 'histories[0].province = "BC"',
  // Always necessary for CRMP database
  networkFilters: 'name != "PCIC Climate Variables"',
  // pdpDataUrl values will be replaced by dev or prod URLs when they become ready.
  // For now, we have a demo instance inside the firewall, below.
  // Uses development database
  pdpDataUrl:
    "https://beehive.pacificclimate.org/station-data-portal/pcds/data",
  // optional Debug params
  //stationFilters: histories[0].province = "BC"
  //stationDebugFetchOptions: false
  //stationDebugFetchLimits: [100, 500, 1000, 2000, 4000, 8000]
  //stationOffset: undefined
  //stationLimit: undefined
  //stationStride: undefined
  //showReloadStationsButton: false
  //timingEnabled: false
};
```

#### PCDS data portal

```js
window.env = {
  appTitle: "BC Station Data - PCDS",
  baseMap: "BC",
  // uses development database
  sdsUrl:
    "https://beehive.pacificclimate.org/station-data-portal/pcds/metadata",
  // Currently deployed metadata backends do not respond to provinces QP.
  // When they do, we can invert the commenting out below.
  //stationsQpProvinces: "BC",
  stationFilters: 'histories[0].province = "BC"',
  // Always necessary for CRMP database
  networkFilters: 'name != "PCIC Climate Variables"',
  pdpDataUrl:
    "https://beehive.pacificclimate.org/station-data-portal/pcds/data",
};
```

#### YNWT data portal

```js
window.env = {
  appTitle: "YNWT Station Data",
  baseMap: "YNWT",
  // We do not at present need to filter based on province (verify!)
  //stationsQpProvinces: YK,NT
  // We do not at present need to filter networks (verify!)
  //networkFilters: ???
  sdsUrl:
    "https://beehive.pacificclimate.org/station-data-portal/ynwt/metadata",
  pdpDataUrl:
    "https://beehive.pacificclimate.org/station-data-portal/ynwt/metadata",
};
```

### Custom configuration and Docker deployment

To use a custom configuration in a Docker deployment, mount
a custom config file to `/app/public/config.yaml`.
For example, in your docker-compose.yaml, include the following mount:

```yaml
volumes:
  - type: bind
    source: /path/to/custom/config.js
    target: /app/config.js
    read_only: true
```

Note: We mount to target `/app/config.js` because the app is built and loaded into
this directory. When executed the docker container's entrypoint will substitute any
`%PUBLIC_URL%` references in code (`%REPLACE_PUBLIC_URL%` in the container) with
the values of PUBLIC_URL in the config.js.

## Environment variables

A small number of configuration parameters must be provided via environment
variables.

In a Create React App app, [environment variables are managed carefully](https://facebook.github.io/create-react-app/docs/adding-custom-environment-variables).
Therefore, most of the environment variables below begin with `REACT_APP_`,
as required by CRA.

For development runs of the app launched with `npm start`, the files
`.env` and `.env.development` provide environment variable values.
For more details, see the
[CRA documentation](https://facebook.github.io/create-react-app/docs/adding-custom-environment-variables).

### Build time variables

`PUBLIC_URL`

- Base URL for Station Data Portal frontend.
- For local development this should match the expected local url (generally http://localhost:3000/)
- For production this will be set to %REPLACE_PUBLIC_URL% and needs to be injected at start time. This happens in the docker container's entrypoint.sh and allows us to configure the sites expected path at run time.

`REACT_APP_APP_VERSION`

- Current version of the app.
- Type: string.
- This value should be set using `generate-commitish.sh` when the Docker image is built.
- It is not recommended to manually override the automatically generated value when the image is run.
- Note doubled `APP_` in name.

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
{ "x": [{ "a": "foo" }], "y": "other" }
```

and deselects the item

```json
{ "x": [{ "a": "bar" }], "y": "oh my" }
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
