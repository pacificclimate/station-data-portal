# Functionality

Eventually this document may expand to be a more complete statement of
requirements and functionality. For now it contains an assortment of notes
about those topics.

## Selection of area by map polygon

Draw rectangles or polygons to limit matching stations and selected downloads.
Shapes can be edited or removed with the map tools. Drawing, editing or clearing
an area clears the checkbox selection. Stations outside the area can still be
inspected and downloaded directly; their selection checkbox is disabled.

## Station data ZIP downloads

Map summaries, preview pages and metadata table rows offer
single-station downloads. Checkboxes in the table and map summary share a
selection; the Selected button opens one download dialog for that station set.
Selections are unique across histories and cleared when filters change. Selected
only affects table display, not the metadata CSV export.

The dialog posts a native URL-encoded form to `/agg` using numeric database
`station-ids`. Direct single-station downloads are independent of all station and
map filters: only one station ID, output format and data category are sent. Date
bounds are included only when the user explicitly enables clipping. Direct
downloads do not wait for selector metadata or change the current filters.

Selected-station requests retain network, variable, frequency, date,
climatology-only and polygon criteria, even for a selected set of one station.
IDs intersect the supplied filters. A pre-submission check blocks the whole batch
if any station conflicts and names the problem; it never silently drops a station
or broadens the request. The same history must match area and criteria together,
and checks update while the dialog is open. Polygon boundaries are included and
hole interiors excluded, matching intersection semantics.

Stations outside the area remain inspectable on the map. Their popup selection
checkbox is disabled with an explanation, while direct download remains available.
Hover tooltips show identification only; downloads belong in the station popup.
Timeseries and climatology use separate server-generated ZIPs; format choices
remain NetCDF, CSV and Excel. The browser manages streaming and errors open in a
separate tab.

## Station table and filters

The map's Table button opens the station metadata table. The table and map
Filters buttons open the same filter panel. Closing filters returns to the table
if it was open. Criteria use Networks, Variables, Observations, Dates, Area and
Attributes sections. Shared criteria and current-view attributes filter the map
and table together; summaries show matching stations and histories.
History and station views retain their own attributes and show active counts.

Clear offers All or the current section. It restores selector All values, resets
dates/options/area, and clears the current view's attributes. All resets both
views and Selected only. Clearing an area removes its map drawing too. Filter
counts ignore inactive constraints and unavailable unpublished network options.

Name, native ID and unique names support Contains any alternatives: case-insensitive
OR within the field and AND with other fields. Enter or Add creates removable
entries; punctuation is literal and duplicates collapse. One field counts once.
Selections clear when criteria change. Filters operate on all matching stations,
independently of the table's Selected only view.

The selection checkbox has its own column; its header selects or deselects every
matching station across pages, showing partial selection when appropriate.
Actions are centred separately. The grouped toolbar has one Download menu for
selected station data, all matching station data and metadata CSV. Metadata CSV
follows shared attributes, across every page; checkboxes and Selected only
do not limit it. It keeps original coordinate precision, dates and variables.

Variable cells show three names and can expand; locations and record spans use
three-line cells. Network names include their colour marker. Preview links open
the station preview page.

## Map and station panels

Round Table, Networks and Filters buttons sit on the map. Table and Filters share
one panel on the right, showing one at a time. The map stays interactive, without
a backdrop, focus trap or page scroll lock. On narrow screens the panel sits below
the map. Closing panels retains filters and checkbox selections.

The table heading, controls and column headers stay pinned while rows scroll.
Networks opens an expandable colour legend over the map. Network filtering is
available in Filters. Preview links open the station preview page.
