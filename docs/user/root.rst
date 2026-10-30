Station Data Portal
===================

Use the Station Data Portal to find weather and climate observation stations,
inspect their records, preview variables, and download data. The available
stations and networks depend on the portal instance you are using.

Open the portal from the `PCIC Data Portal <https://pacificclimate.org/data>`_.
Accept the terms of use if prompted, then allow the station metadata to load.
Info icons beside controls provide short explanations.

Map and station information
---------------------------

Drag the map to pan; use its zoom buttons or mouse wheel to zoom. Moving or
zooming the map does not filter stations or limit downloads to the visible area.
You can zoom in beyond the basemap's native detail to separate nearby station
markers. Existing tiles are enlarged at these closer zoom levels; labels and
background features may look softer, but station locations remain selectable.
Station marker colours identify their networks. A station may have several
history records describing changes to its name, location or instruments;
lines connect its different recorded locations.

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
Table counts checked stations, while a badge on Filters counts active filters.
The network legend explains marker colours; it does not enable or disable
networks.

The table and filters share a panel, with one visible at a time. The map remains
interactive beside it. Opening Filters from the table replaces the table;
closing Filters returns to it. Closing a panel retains its filters and download
selection. On smaller screens the table appears below the map.

Click a marker to open its station summary. This shows its network, IDs,
locations, record spans, observation frequencies and recorded variables.
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
  network; **None** clears the network choices.
* **Variables**: find stations recording the chosen variables. Use **All**,
  **None**, or the variable group buttons to change the choices together.
* **Observations**: choose observation frequencies, whether to include stations
  with no observations, and whether to require climatology records.
* **Dates**: set a start date, an end date, or both to filter stations by record
  coverage. This does not clip downloaded observations unless date clipping
  is enabled in the download dialog.
* **Area**: review or clear the area drawn on the map.
* **Attributes**: filter the current table view by fields such as station name,
  native ID, province and elevation.

Badges count active criteria and attributes. Network, variable and frequency
choices count as active when they differ from All. A field with several text
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

Use the map's rectangle or polygon tool to draw an area of interest. For a
rectangle, choose opposite corners. For a polygon, choose its corners and
finish the shape. Use the edit tool to move its corners, or the removal tool
to delete shapes. The removal tool also provides **Clear all**.

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
Use its paging controls to move through results. Location cells combine
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
or use **Clear selection** to clear the whole selection.

**Selected only** limits the table display to checked stations. It does not
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

The table's **Download** menu offers checked stations, all matching stations,
and metadata. Counts beside the station download choices distinguish the checked
selection from the entire matching set.

* Choose the selected-stations option to download the checked stations.
* Choose the all-matching option to download the current matching set without
  checking rows first.

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

Choose **Metadata** from the table's Download menu to export the matching
stations as CSV. The export follows the shared filters, drawn area and active
table attributes. It includes all histories for the matching stations and full
variable lists and coordinate fields, even where the table uses compact cells.

Checkboxes and Selected only do not restrict metadata export. To export a
smaller metadata set, narrow the filters.

Previewing variables
--------------------

**Preview variables** opens a dialog over the map with graphs of the station's
variables. Use the date controls, range slider and duration options to explore
their observations. Show or hide the graph legend as needed. Gaps in observations can
appear within a station's record span; a span does not imply continuous data.

Close the preview to return to the map and its panels. Preview links can also
be copied or opened in another tab. A station without associated variables
cannot display variable graphs.

Sharing a view
--------------

Copy the browser address to share a station preview, open table or filters,
network legend, station criteria, table grouping, attribute filters, drawn areas
and the map's current position and zoom.
Browser Back and Forward navigate between panel and preview views.

The address uses an encoded view value instead of a long JSON query. Existing
links using the older format still open. When an area is shared, its editable
drawing and its filter are restored together, including multiple shapes and
holes. Panning, zooming, changing filters or editing a drawing updates the link
without adding a history entry for every change.

Checked stations and Selected only are not included in the link. A recipient
must check stations again for a selected-station download. Shared links reflect
the data available when opened, so station counts can change over time.

Programmatic access
-------------------

For station listings, scripted downloads and aggregate requests, see the
Station Data API sections of this documentation site. Portal controls and
API request parameters are documented separately.

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
