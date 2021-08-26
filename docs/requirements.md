# Requirements

## Execution environment

Node.js >= 9.2.0 (**important**)

All other package requirements are specified in `package.json`.

We **strongly** recommend using [`nvm`](https://github.com/creationix/nvm) to manage your `node`/`npm` install.
In particular, you will have trouble finding later versions of Node.js in standard Linux installs;
`nvm` however is up to date with all recent releases.

Note: Avoid `snap` packages. Experience to date suggests it does not result in stable, reliable installations.

## Backend services

- [Station Data Portal Backend](https://github.com/pacificclimate/station-data-portal-backend): provides all metadata
- PCDS Data Download Backend: provides station data (TBD)

This frontend is modelled on (and a feature superset of) the existing
[PCDS](https://data.pacificclimate.org/portal/pcds/map/) data portal,
but built in React and with a more modern and flexible UI.

Since the backends work with any PyCDS schema database, this application can replace PCDS
simply by being pointed at backends connected to the CRMP database.

