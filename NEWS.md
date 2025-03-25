# News / Release Notes

## 1.7.0

_Release Date: 2025-Mar-025_

Requires:

- Station Data Portal Backend: version 11.4.1
- PDP backend: branch `pcds_only`

Changes:

- Updated developer documentation
- Update node and ubuntu dependencies to 22.14 and 24.04 respectively
- Update docker builds to work with static assets vastly speeding up frontend start up time

## 1.6.1

_Release Date: 2024-Apr-04_

Requires:

- Station Data Portal Backend: version 11.4.1
- PDP backend: branch `pcds_only`

Changes:

- [Bugfixes for previous release](https://github.com/pacificclimate/station-data-portal/pull/180)
  - Fixes errors in observation counts causing screen crashes
  - polygon selections are correctly passed to download urls
  - download url filenames are correctly set
  - a race condition when viewing preview resulting in an error due to missing station id has been fixed

## 1.6.0

_Release Date: 2024-Mar-24_

Requires:

- Station Data Portal Backend: version 11.4.0
- PDP backend: branch `pcds_only`

Changes:

- [Add station data preview screen](https://github.com/pacificclimate/station-data-portal/pull/179)
- [Add links to preview via metadata table and station popups](https://github.com/pacificclimate/station-data-portal/pull/179)

## 1.5.0

_Release Date: 2023-Sep-18_

Requires:

- Station Data Portal Backend: version 11.2.0
- PDP backend: branch `pcds_only`

Changes:

- [Improve ObservationCount behaviour](https://github.com/pacificclimate/station-data-portal/pull/173)
- [Add filtering to metadata table](https://github.com/pacificclimate/station-data-portal/pull/165)

## 1.4.0

_Release Date: 2023-Aug-28_

Requires:

- Station Data Portal Backend: version 11.2.0
- PDP backend: branch `pcds_only`

Changes:

- [Apply date filtering to observation counts (Station Data tab)](https://github.com/pacificclimate/station-data-portal/pull/164)

## 1.3.0

_Release Date: 2023-Aug-25_

Requires:

- Station Data Portal Backend: version 11.2.0
- PDP backend: branch `pcds_only`

Changes:

- [Filter climatological variables using tags attribute](https://github.com/pacificclimate/station-data-portal/pull/161)

## 1.2.0

_Release Date: 2022-Aug-16_

First production release.

Requires:

- Station Data Portal Backend: version 10.3.0
- PDP backend: branch `pcds_only`

Changes:

- [Update user documentation (published on PDP)](https://github.com/pacificclimate/station-data-portal/pull/154)
- [Handle filtering of stations with histories with no observations](https://github.com/pacificclimate/station-data-portal/pull/152)
- [Add column sorting to Networks table](https://github.com/pacificclimate/station-data-portal/pull/151)
- [Apply provinces query param to all metadata requests ]()

## 1.1.0

_Release Date: 2022-Jul-22_

Candidate production release.

Requires:

- Station Data Portal Backend ver 10.2.0
- PDP backend: branch `pcds_only`

Changes:

- [Add warning (or disable) download buttons when request URL is too long](https://github.com/pacificclimate/station-data-portal/pull/145)
- [Add station count to Networks tab](https://github.com/pacificclimate/station-data-portal/pull/142)

## 1.0.0

_Release Date: 2022-Jul-18_

Candidate production release.

Requires:

- Station Data Portal Backend ver 10.1.0
- PDP backend: branch `pcds_only`

- Changes:

- [Use pcic-react-leaflet-components 3.0.1](https://github.com/pacificclimate/station-data-portal/pull/140)
- [Config via YAML file](https://github.com/pacificclimate/station-data-portal/pull/139).
- [Housekeeping](https://github.com/pacificclimate/station-data-portal/pull/138)
  Major improvements in code maintainability.
- [Add user docs](https://github.com/pacificclimate/station-data-portal/pull/126)
- [Fix the date pickers](https://github.com/pacificclimate/station-data-portal/pull/137)
- [Improve use of concurrency](https://github.com/pacificclimate/station-data-portal/pull/136)
- [Decouple marker radius update from base layer update](https://github.com/pacificclimate/station-data-portal/pull/134)
- [Fix leftover UI deficiencies](https://github.com/pacificclimate/station-data-portal/pull/133)
- [Upgrade to React 18, React Leaflet 4, React Bootstrap 2.x](https://github.com/pacificclimate/station-data-portal/pull/132).
  Enables major improvements to app responsiveness.
- [Use Lethargy package to fix inertial scroll zoom on Macs](https://github.com/pacificclimate/station-data-portal/pull/130)
- [Add metadata download (CSV only)](https://github.com/pacificclimate/station-data-portal/pull/117)
- [Enable/disable timing from config](https://github.com/pacificclimate/station-data-portal/pull/123)
- [Use config to set provinces query param on stations request](https://github.com/pacificclimate/station-data-portal/pull/122)
- [Add optional disclaimer dialogue](https://github.com/pacificclimate/station-data-portal/pull/116)
- [Handle last remaining item removed from a filter selector](https://github.com/pacificclimate/station-data-portal/pull/115)
- [Use smaller radius markers at lower zooms](https://github.com/pacificclimate/station-data-portal/pull/112)
- [Fix favicon and title](https://github.com/pacificclimate/station-data-portal/pull/111)
- [Fix frequency query parameter for data download for "all freqs" condition](https://github.com/pacificclimate/station-data-portal/pull/109)
- [Refactor for maintainability](https://github.com/pacificclimate/station-data-portal/pull/108)
- [Restore lazy popups](https://github.com/pacificclimate/station-data-portal/pull/103)
- [Upgrade to React 17, React Leaflet 3.x](https://github.com/pacificclimate/station-data-portal/pull/102).
  Note subsequent upgrade to React 18, etc.
- [Improve app performance](https://github.com/pacificclimate/station-data-portal/pull/98)

## 0.1.0

_Release Date: 2022-Mar-31_

First dev release. Brings us to PR #92.
