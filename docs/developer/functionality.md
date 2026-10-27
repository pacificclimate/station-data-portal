# Functionality

Eventually this document may expand to be a more complete statement of
requirements and functionality. For now it contains an assortment of notes
about those topics.

## Selection of area by map polygon

Leaflet, or at least our ability to make it do what we want it to do, seems to
impose the following choice on us:

1. EITHER map polygons can be edited and deleted individually (by clicking on
   the polygon, rather than by clicking Clear All),
2. OR markers inside a polygon can be interacted with (hover for tootip;
   click for station info).

At present, we have chosen (1).

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
