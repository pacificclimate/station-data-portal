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

Station tooltips, map summaries, preview pages and metadata table rows offer
single-station downloads. Checkboxes in the table and map summary share a
selection; the Selected button opens one download dialog for that station set.
Selections are unique across histories and cleared when filters change. Selected
only affects table display, not the metadata CSV export.

The dialog posts a native URL-encoded form to `/agg` using numeric database
`station-ids`, network names, variables, observation frequencies, dates,
climatology-only criteria and the map polygon. IDs intersect those filters.
Date clipping is separate from date filtering. Timeseries and climatology are
separate server-generated ZIPs; format choices remain NetCDF, CSV and Excel.
The browser manages streaming and errors open in a separate tab.

The existing tabs, standalone preview route, metadata export scope and inline
table filters remain in place in this branch. Workspace changes follow separately.
