# Functionality

Eventually this document may expand to be a more complete statement of
requirements and functionality. For now it contains an assortment of notes
about those topics.

## Selection of area by map polygon

Draw rectangles or polygons to limit matching stations and selected downloads.
Shapes can be edited or removed with the map tools. Drawing, editing or clearing
an area clears the checkbox selection. Stations outside the area can still be
inspected and downloaded directly; their selection checkbox is disabled.

## Station downloads

The station popup, station preview, and metadata table open a shared
station download dialog. Single stations, checked stations, and all matching
stations use the station-ID filter on `pdp-station-api`'s `/agg` endpoint. The data API is configured by `config.pdpDataUrl`.

Each action submits the exact numeric database station IDs through a native
form-encoded POST: `station-ids=37,42`, `format=nc`, and `climatology=true` or
`false`. IDs are deduplicated and sorted. The server generates one ZIP containing
its existing network folders, station files and variable indexes. Empty or invalid
ID lists are rejected locally and must never fall back to an unrestricted request.

The browser handles the attachment download directly, avoiding GET URL-length
limits and JavaScript archive buffering or ZIP assembly. Requests target a separate
browser tab so a server validation/error response cannot navigate away from the
map. Download progress and cancellation are managed by the browser's download UI.

Direct single-station downloads are independent of all station and map filters.
They send exactly one station ID, output format and data category. No network,
variable, frequency, polygon, climatology-only or implicit date filters are sent.
Date bounds are included only when the user explicitly enables clipping. Direct
downloads do not wait for selector metadata or change current filters. Hover
tooltips show station identification only; download actions live in the popup.

Selected-station and all-matching requests include the active network, variable,
frequency, polygon, climatology-only and date criteria. A selected set containing
one station still retains all those criteria. The backend intersects them with
station IDs and publication restrictions. An excluded ID is not downloaded.

Before offering a selected-station ZIP, the dialog checks the requested stations against the
supplied criteria. It blocks the entire batch if any station conflicts, naming
the station and explaining the conflict rather than silently dropping it. A
history must match the area and criteria together. Validation updates while the
dialog is open. Popup selection is disabled outside the drawn area, with an
explanation; the direct station download remains available. Polygon boundaries
are included and hole interiors excluded, matching intersection semantics.
Dates select stations by coverage regardless of clipping; `clip_dates=true` also
clips observations to `from_date` and/or `to_date`. All recorded variables remain
in the station files. Selected-station actions wait for filter metadata and do not submit
an unrestricted request when the network/observation criteria match no stations.

The station summary and table share a download selection. Checkboxes select
stations across pages and both table views, deduplicating multiple histories.
Changing filtering criteria clears the entire download selection, including
changes to networks, dates, variables, frequency, observation/climatology options,
the drawn polygon, or active table attributes. This applies while the table is
closed too. Opening or closing panels and toggling Selected only do not change
selection criteria. Column filters share the Filters section with map filters
and apply immediately. The backend receives table attribute constraints through
the filtered ID list, alongside the other supported selection criteria.

“Show on map” frames all valid history locations and opens the existing station
summary when the map arrives. A neutral ring pulses three times around the station marker. The ring does not capture pointer or keyboard
input. Clicking any station stops the ring and opens its existing summary.

The table header checkbox selects every matching station across all pages,
deduplicating history rows. It shows an indeterminate state for partial selection
and unchecking it removes matching stations from the selection. “Download all matching stations” opens the same modal without
requiring checkboxes first. The modal includes station, observation, and
climatology totals, a station list, date clipping, and output format. Counts are
summed for the exact download selection; clipping updates observation estimates.
The station-ID request is used for every selection size, including one station and
the complete matching set. Download options are available in this dialog.

## Map and station panels

Table opens a panel to the right of the map. Its title, controls and column
headers stay pinned while table rows scroll independently.
Filters and Table share one panel on the right, showing one at a time. Both the
map and table filter buttons open the same panel; closing filters returns to the
table if it was open. Switching to Table hides Filters. A deep link with both flags
opens Filters and retains Table as the return view. The map stays interactive;
the panel has no backdrop, focus trap or page scroll lock.
Map criteria and station attribute filters update both views immediately, including
when the table is closed. Attribute filtering uses the table's own accessors and
filter functions. Closing panels retains filters and the download selection.
On narrow screens the table sits below the map. Networks toggles an expandable
legend over the map; network selection is available in Filters.

Table attribute filters are represented in downloads by the exact resulting
station IDs, so filtered subsets also use server aggregation.

Variable cells initially display three names, with a corner control to expand a
scrollable list. Location combines latitude, longitude and elevation on three lines.
Metadata CSV exports retain full variable lists and the original coordinate fields.

Filter badges on the map and table count shared station criteria plus active
attribute filters for the current table view. Criteria count network, variable
and frequency selections that differ from All, date bounds, climatology and
observation options that differ from their defaults, and the drawn area. All,
empty text and empty numeric ranges do not count as attribute constraints.
The Filters section separates shared Station criteria from By History/By Station
attributes, shows each count and lists active criteria. Attributes remain saved
per view; a note identifies saved attributes belonging to the other view.

## Sharing filters and variable previews

Round Table, Networks and Filters icon buttons sit on the map. The Filters section
uses compact Networks, Variables, Observations, Dates, Area and Attributes tabs.
Criteria selectors are available in the Filters panel. Tab badges
identify active criteria even when that tab is closed. Choices persist when
switching tabs. The Area tab can clear the constraint and its visible map drawings.

Variable preview links in station summaries and table rows open a dialog over the
map. They remain real `/preview/{stationId}` links, supporting
copying, new tabs, direct visits, and browser Back and Forward. Closing a directly
opened preview returns to the map with the same query parameters. Preview graphs
are loaded only for a preview route, keeping Plotly out of the map's initial bundle.

Shareable URLs retain open Table, Filters and Networks panels through `table=1`,
`filters=1` and `networks=1`. The `criteria` JSON query parameter restores date bounds,
network/variable/frequency selection, observation/climatology criteria, table grouping
and station-attribute filters. Filter edits replace the current history entry;
opening panels and station previews creates a navigable entry. Incoming URL data
is validated before updating the store, and restored selections take precedence
over startup defaults. Download checkboxes and map navigation stay local.

The station table toolbar groups View (history/station, Filters, Selected only),
Select (clear), and Export. One Download menu offers
checked stations, all matching stations, and metadata CSV. Matching counts refer
to filters, independently of checkbox selection. Help is beside the table title;
controls wrap within the side panel.
Location cells keep coordinate directions and elevation units aligned on the right.

Selection checkboxes occupy their own centred column; station actions have a
separate centred column. The header checkbox selects/deselects
matching stations across every page.

The Filters Clear menu offers All and the current tab. Clearing a selector tab
restores its full available set rather than selecting None. Observations also
resets its two options; Dates removes both bounds; Area removes the drawing;
Attributes clears the current table view's attributes. All clears shared criteria,
both views' saved attributes and Selected only together. Counts derive from the
same updated state. Unpublished networks are excluded from the selectable All
set and do not leave a phantom active-network count after clearing.

Text attributes (station name, native ID and unique names) use Contains any with
removable alternatives. Typing filters immediately; Enter, Add or leaving the
input commits an alternative. Matching is case-insensitive OR within a field and
AND between fields. Commas and other punctuation remain literal, blank terms are
ignored and case-insensitive duplicates collapse. Numeric station link IDs are
not searched as station names. Each field counts once, regardless of alternatives.
Field clear, Clear Attributes and Clear All reset the entries as well as the
matching set and badges. Deep links preserve text arrays while accepting legacy
single strings; invalid non-string text alternatives are rejected. The map and
table use the same predicate, and attribute constraints reach aggregate downloads
through the resulting station IDs.

The filter pane's matching rows are independent of the table's Selected only
view. Selected only remains a table display option and does not hide otherwise
matching stations from filter controls or their counts.
