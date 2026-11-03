Meteorological Data Portal
==========================

The Meteorological Data Portal (MDP) lets you find weather and climate
observation stations, inspect their records, preview variables, and download
data from PCIC's observational databases. Regional instances include BC Station
Data (the Provincial Climate Data Set, or PCDS) and Yukon and Northwest
Territories Station Data. The controls work in the same way across instances;
the available stations and networks depend on the database being served.

Open the portal from the `PCIC Data Portal <https://pacificclimate.org/data>`_.
Accept the terms of use if prompted, then allow the station metadata to load.
A spinner and Loading messages indicate that station or filter information is
still being fetched. Once loaded, station markers and filter choices appear.
Hover over the info icons beside controls for explanations; the table also has
a Help button beside its title.

Map and station information
---------------------------

Drag the map to pan; use its zoom buttons or mouse wheel to zoom. Double-click
the map to zoom in. Moving or zooming the map does not filter stations or limit
downloads to the visible area.
You can zoom in beyond the basemap's native detail to separate nearby station
markers. Existing tiles are enlarged at these closer zoom levels; labels and
background features may look softer, but station locations remain selectable.
Station marker colours identify their networks. Lines connect a station's
different recorded locations.

Stations and histories
~~~~~~~~~~~~~~~~~~~~~~

Each station has one or more history records. A history describes a particular
station configuration, including its name, location, elevation and reported
variables. Several histories can reflect changes to the station's location or
instruments over time.

The map shows a marker for each distinct recorded location. The station summary
lists its histories and locations. In the table, **By History** displays one
history per row, while **By Station** groups the histories belonging to the
same station.

Finding the tools
~~~~~~~~~~~~~~~~~

The three round buttons over the map open Table, Network legend and Filters.
Hover over an icon to see its name. The same filter controls are also available
from the labelled **Filters** button in the table.

.. list-table:: Icon key
   :header-rows: 1
   :widths: 10 25 65

   * - Icon
     - Control
     - What it opens or does
   * - |table icon|
     - Table
     - Opens the station table beside the map.
   * - |networks icon|
     - Network legend
     - Shows network names and marker colours. Change networks in Filters.
   * - |filters icon|
     - Filters
     - Opens shared station criteria and the current view's attribute filters.
   * - |download icon|
     - Download station data
     - Opens download options for the station in that table row.
   * - |preview icon|
     - Preview variables
     - Opens that station's variable graphs over the map.
   * - |locate icon|
     - Locate station on map
     - Moves the map to the station and opens its summary.
   * - |help icon|
     - Station table help
     - Shows explanations of the table controls below its heading.

The first three icons are map buttons. Download, Preview and Locate are in each
table row's Actions column; Help is beside the table title. A numbered badge on
Table counts checked stations, while a dot on Filters indicates active filters.
The network legend explains marker colours; it does not enable or disable
networks. Expand a network's entry to see its full name and, when available,
its station count.

The table and filters share a panel, with one visible at a time. The map remains
interactive beside it. Opening Filters from the table replaces the table;
closing Filters returns to it. Closing a panel retains its filters and download
selection. On smaller screens the table appears below the map.

Click a marker to open its station summary. This shows its network, IDs,
locations, record spans, observation frequencies and recorded variables. The
variable list initially shows three entries; use its expand button to see all
variables and collapse it again when finished.
Use **Preview variables** to inspect graphs, **Download station data** for a
single-station download, or **Select for download** to add it to a batch.
Close the summary with its close button.

Panels, popups and dialogs
~~~~~~~~~~~~~~~~~~~~~~~~~~

* **Table and Filters panels** sit beside the map. Use a panel's close button
  or its map button to close it. Filters also has a Done button. The map remains
  usable while either panel is open.
* **Station summaries** open when you click a marker or use Locate. They are
  attached to a station on the map and contain selection, download and preview
  controls. Their close button dismisses them.
* **Variable preview** is a dialog over the map. Close it with its top-right
  close button, Close preview, or Escape to return to the map.
* **Download station data** is a separate dialog for reviewing included
  stations and choosing format, date clipping and observation or climatology
  output. Its close button or Escape returns to the previous view without
  starting a download.

Finding matching stations
-------------------------

Open **Filters** from the map or table. Changes apply immediately to the map
and table. Matching counts describe the stations satisfying the filters;
these are separate from stations checked for download.

The **By History / By Station** toggle above the filter tabs is shared with
the table. It is available even when the table is closed. Use it to choose the
attribute fields and saved attribute filters to apply. Networks, Variables,
Observations, Dates and Area remain shared criteria in either mode. Changing
the grouping can change the matching set because each view has its own saved
attributes. Switching to different active attribute filters clears the download
selection.

The filter tabs contain:

* **Networks**: choose observing networks. **All** includes every available
  network; **None** clears the network choices. Start typing in the selector to
  find a network, or remove a selected network with its X button.
* **Variables**: find stations recording at least one of the chosen variables.
  Use **All**, **None**, or the variable group buttons to change the choices
  together. Type to find a variable or remove an individual choice with its X.
* **Observations**: choose observation frequencies, such as Daily or Hourly.
  **All** includes every frequency, including Unspecified; **None** clears the
  choices. **Include stations with no observations** also permits stations
  without recorded observations. **Only include stations with climatology**
  restricts the results to stations with climatology variables. Both checkboxes
  are initially unchecked.
* **Dates**: set a start date, an end date, or both to filter stations by record
  coverage. This does not clip downloaded observations unless date clipping
  is enabled in the download dialog.
* **Area**: review or clear the area drawn on the map.
* **Attributes**: filter the current table view by fields such as station name,
  native ID, province and elevation.

Dots mark filter tabs with active criteria or attributes. Network, variable
and frequency choices count as active when they differ from All. A field with several text
alternatives counts as one attribute filter.

The **Clear** menu offers **All** and the current tab. Clearing Networks,
Variables or Observations restores their full choices rather than None.
Clearing Dates removes both date bounds. Clearing Area also removes the drawing.
Clearing Attributes resets attributes for the current table view. **Clear → All**
resets shared criteria, both views' attributes, and Selected only.

Example: find stations by elevation
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

1. Open **Filters** and choose **By History** using the toggle above its tabs.
   Elevation is an attribute of a history record, so its range control is
   available in this view.
2. Choose the **Attributes** tab.
3. Under **Elevation (m)**, enter a minimum, a maximum, or both. For example,
   enter ``1000`` as the minimum to find histories at or above 1,000 metres.
4. Choose **Done**, then open **Table** if it is not already open. Use a row's
   Locate action to inspect a result on the map.

Leave a bound blank for an open-ended range. Other criteria still apply: a
network choice, date range or drawn area can further narrow the result. Use
**Clear → Attributes** to remove the current view's attribute constraints, or
**Clear → All** to start again. Switching to By Station uses that view's saved
attributes; the By History elevation filter remains saved for when you return.

Text alternatives
~~~~~~~~~~~~~~~~~

Text attributes use **Contains any**. For example, to match names containing
``st``, ``pl`` or ``rd``, enter each alternative and press Enter or use Add.
Typing already updates the matches; leaving the field also adds the current
entry. Remove individual alternatives with their remove buttons.

Matching ignores letter case. A station needs to match any alternative within
one field, and all the other active filters. Punctuation, including commas,
is literal: enter three separate alternatives rather than ``st, pl, rd``.

Drawing an area
~~~~~~~~~~~~~~~

Use the map's rectangle or polygon tool to draw one or more areas of interest:

* **Rectangle**: click one corner, then the opposite corner. Its boundaries
  follow lines of latitude and longitude.
* **Polygon**: click successive corners. Click the first corner again or use
  **Finish** to complete the shape.
* **Edit layers**: drag a shape's corner handles to adjust it. A rectangle
  remains a rectangle. Use the handles between polygon corners to add corners,
  or right-click a corner to remove it. Choose **Finish** when done.
* **Remove layers**: click shapes to delete them, or choose **Clear all** to
  remove every shape. Choose **Finish** to leave removal mode.

Drawing, editing or clearing an area updates the matching table and download
scope and clears the download checkboxes. Stations outside the area can remain
visible on the map for inspection. Their summary explains why they cannot be
checked for a batch download; a direct single-station download is still
available. With several shapes, stations inside any shape are included.

Using the station table
-----------------------

**By History** shows one history record per row. **By Station** combines the
histories belonging to a station. Shared station criteria apply in both views;
attribute filters are saved separately for each view. The filter panel identifies
which view's attributes you are editing.

The table keeps its controls and column headings visible while rows scroll.
Paging controls remain below the scrolling rows. Use them to move through
results. Location cells combine
latitude, longitude and elevation; record spans show start and end dates.
Variable cells initially show three entries; expand a cell to browse the rest.
Network names have markers matching their map colours. The help button beside
the table title explains its controls.

Each row has a separate checkbox and station actions:

* Download opens that station's download dialog.
* Preview opens its variable graphs.
* Show on map moves to the station and opens its summary. A neutral locator
  ring pulses three times. Clicking a station stops the locator.

Checking stations for download
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Check a row to add its station to the download selection. A station with several
history rows is included only once. Selection is shared across pages, table
views and station summaries.

The header checkbox checks all matching stations across every page, not just
the visible page. A partially checked header indicates that only some matching
stations are checked. Uncheck it to remove matching stations from the selection,
or use **Clear selected (count)** to clear the whole selection.

**Show selected only** below the main table controls limits the table display to checked stations. It does not
change the shared filters or matching set. Turning it off reveals the other
matching stations again.

Changing filtering criteria clears the download selection, including changes
to attributes or a drawn area. Opening or closing panels and toggling Selected
only do not clear it. Select stations after setting your filters.

Downloading station data
------------------------

Single station
~~~~~~~~~~~~~~

Choose **Download station data** in a station summary or preview, or use the
row's download action. This downloads that station independently of network,
variable, frequency and area filters. It also ignores the station-selection
date range unless you explicitly enable date clipping.

For example, a station outside a drawn area can still be downloaded directly.
Its direct download does not change your filters or checked stations.

Selected or all matching stations
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The **Download** menu sits over the map's bottom-right corner, or at the top
right of the table toolbar when the table is visible. It offers checked stations, all matching
stations, and metadata.
Counts beside the station download choices distinguish the checked selection
from the entire matching set.

* Choose the selected-stations option to download the checked stations.
* Choose **All stations** with no active filters, or **All filtered** when
  filters are active, to download the current matching set without checking
  rows first.

These batch downloads respect the active station criteria and drawn area,
even when the batch contains only one station. Requested station IDs do not
override the filters. If a requested station conflicts with them, the dialog
explains the conflict and blocks the download until it is resolved.

Download options
~~~~~~~~~~~~~~~~

The download dialog shows the station count, observation and climatology totals,
and an expandable list of included stations. Counts are summaries; enabling
clipping updates observation estimates.

1. Choose **NetCDF**, **CSV/ASCII** or **MS Excel 2010** as the output format.
2. Optionally enable **Clip time series to filter date range** to restrict
   observations to the start and/or end date in Filters. Without clipping,
   the date criteria select stations but their full time series are downloaded.
3. Choose **Download Timeseries ZIP** for observations or **Download Climatology
   ZIP** for climatologies.

The server prepares one ZIP containing the station files and variable indexes.
Your browser manages progress and saving. Server error responses open in a
separate tab, leaving the portal available.

Variable filters find stations; the station files include all recorded
variables. Stations without observations can have metadata-only files when
they are included in the download scope.

Metadata CSV
~~~~~~~~~~~~

Choose **Metadata** from the Download menu to export the matching
stations as CSV. The export follows the shared filters, drawn area and active
table attributes. It includes all histories for the matching stations and full
variable lists and coordinate fields, even where the table uses compact cells.

Checkboxes and Selected only do not restrict metadata export. To export a
smaller metadata set, narrow the filters.

Station Preview
---------------

Choose **Preview variables** in a station summary or use the table row's
Preview action to inspect that station's observations. The station preview
opens in a **Variable preview** dialog over the map. It contains station
history details, time-range controls and one graph per available variable.

Station history details
~~~~~~~~~~~~~~~~~~~~~~~

At the top of the preview, each history heading shows its station name and
observation date span. Expand a heading to inspect that history's latitude,
longitude, elevation, province and the station's native ID. A station may have
several histories, so check the location and date span when interpreting its
observations.

Choosing the preview period
~~~~~~~~~~~~~~~~~~~~~~~~~~~

The time-range control shows the overall span of the station's variable
records and the window currently displayed by the graphs.

* Drag a range handle or click the timeline to move the displayed time window.
* Choose **1 Month**, **3 Months** or **6 Months** to set the length of the
  window ending on the selected date.
* Use the **Ending** date picker to choose another end date. The start date
  moves with it according to the chosen duration.

A newly opened station preview initially shows six months ending at its latest
available observation. Moving the time window updates the graphs. Preview dates
are separate from the station filters and do not automatically clip downloads;
choose date clipping in the download dialog when needed.

Reading the graphs and variable details
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Each variable's graph shows observation time along the horizontal axis and its
values and units along the vertical axis. The adjacent legend identifies the
variable and lists its description, units, cell method, standard name and first
and last observation times. Choose **Hide Legend** for more graph space, or
**Show Legend** to restore these details.

Record spans and the range control describe the bounds of available records,
not continuous coverage. Observations can be missing within those bounds. If a
variable has no observations in the displayed period, its graph reports that
no data was found; try another period. A station without associated observation
variables has no variable graphs to display, but its station details and direct
download control remain available.

Close the preview with its top-right close button, **Close preview**, or Escape
to return to the map and its panels. Preview links can also be copied or opened
in another tab. The link identifies the station being previewed; the graph's
chosen time window and legend visibility are not saved in the link.

Sharing a view
--------------

Copy the browser address to share an open station summary or variable preview,
open table or filters, network legend, station criteria, table grouping,
attribute filters, drawn areas and the map's current position and zoom.
Browser Back and Forward navigate between panel and preview views.

The address uses an encoded view value with compact network references and
variable ID ranges. When an area is shared, its editable
drawing and its filter are restored together, including multiple shapes and
holes. Panning, zooming, changing filters or editing a drawing updates the link
without adding a history entry for every change.

Checked stations and Selected only are not included in the link. A recipient
must check stations again for a selected-station download. Shared links reflect
the data available when opened, so station counts can change over time.

Programmatic access
-------------------

For station catalogs and station identifiers, see
:doc:`Station listings <../stations>`. For selecting variables, observation
conditions and scripted downloads, see :doc:`Programmatic downloads
<../programmatic>`. For multi-station ZIP requests, see :doc:`Aggregate downloads
<../aggregate>`. These API guides cover the station-listing and scripted-access
workflows alongside the portal instructions.

.. |table icon| image:: images/ui-table.svg
   :alt: Table icon
   :width: 24px
   :height: 24px

.. |networks icon| image:: images/ui-networks.svg
   :alt: Network legend icon
   :width: 24px
   :height: 24px

.. |filters icon| image:: images/ui-filters.svg
   :alt: Filters icon
   :width: 24px
   :height: 24px

.. |download icon| image:: images/ui-download.svg
   :alt: Download station data icon
   :width: 24px
   :height: 24px

.. |preview icon| image:: images/ui-preview.svg
   :alt: Preview variables icon
   :width: 24px
   :height: 24px

.. |locate icon| image:: images/ui-locate.svg
   :alt: Locate station on map icon
   :width: 24px
   :height: 24px

.. |help icon| image:: images/ui-help.svg
   :alt: Station table help icon
   :width: 24px
   :height: 24px
