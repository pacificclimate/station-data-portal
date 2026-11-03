# User documentation

Maintain the portal user guide in [`docs/user/root.rst`](../user/root.rst),
using reStructuredText. Keep it aligned with the controls and behaviour of the
portal release it describes. Screenshots must show that release's UI; remove
outdated illustrations from the guide rather than presenting obsolete controls.

The shared documentation site is built by `pdp-station-api`. Its Sphinx build
reads `docs/user/manifest.yaml` from a pinned portal commit and imports only
the listed files into `docs/source/portal/`,
adds portal version and revision information, and includes it alongside the API
guide. The API version and portal version are independent.

## Previewing changes

In a local `pdp-station-api` checkout with its documentation dependencies installed:

```console
python3 docs/import_portal.py --local-preview ../station-data-portal
sphinx-build -E -b html --fail-on-warning --keep-going docs/source docs/_build/html
python3 -m http.server 8080 --directory docs/_build/html
```

The local-preview option includes uncommitted guide edits and marks the imported
page as a local preview. Normal builds use the pinned remote source instead.
No frontend build, API service or database is needed to build the guide.

## Releasing documentation

1. Update the guide alongside the UI changes. Store accompanying images under
   `docs/user/images/` and use relative links. Keep `manifest.yaml` aligned with
   the published files. Both the shared site and the historical PDP importer
   use its recursive list of files and directories.
2. Commit and push the reviewed portal changes through the normal release process.
3. In `pdp-station-api/docs/portal-source.json`, set `revision` to the full portal
   commit SHA containing the guide for the portal being deployed. A release tag
   can be resolved to its commit SHA; do not use a moving branch as the pin.
4. Build and review the combined site using the normal pinned importer, then
   deploy the documentation image with the matching API and portal releases.

The source pin determines which UI instructions are published. Updating an API
release does not automatically advance the portal guide. A documentation-only
correction can use a later portal commit if it still describes the deployed UI.

The older PDP documentation build also imports the portal guide using
`docs/user/manifest.yaml`. This is a historical publishing integration; the new
shared site is maintained by the station API repository.
