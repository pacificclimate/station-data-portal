## Production

### Docker

We currently deploy all apps using Docker.
This project contains [Docker infrastructure](../../docker) and a
[GitHub action](../../.github/workflows/docker-publish.yml) that automatically
builds and tags a Docker image on each commit. The image name is
`pcic/station-data-portal-frontend`.

The image holds the built app (`dist/`) and serves it with
[`serve`](https://www.npmjs.com/package/serve) on port 8080. `serve -s`
answers any path that isn't a file with `index.html`, so client-side routes
such as `/preview/<stationId>` survive a hard refresh.

### Configuration, environment variables, and Docker

It is best practice to configure a web app externally, at
run-time, typically using environment variables for any simple
(atomic, e.g., string) configuration values.

A static web app can't read the server's environment, so we use the
following flow to inject this configuration.

1. Configuration information is stored in `public/config.js`.
   This file is mounted in our docker containers with environment
   specific configuration options.
2. Avoid build-time values (`import.meta.env`). They are fixed when
   the image is built, so they can't differ between deployments of the
   same image.
3. Use `window.env` (defined in config.js) as an alternative, any
   environment specific information is appropriate here.
4. `PUBLIC_URL` is special: besides telling the app where it lives, it
   sets the path in the built files, which is rewritten when the
   container starts (see below).

### Base path rewrite at container start

The same image serves the app at the root of a host or under a path, such as
https://services.pacificclimate.org/met-data-portal-pcds/app/. The path isn't
known when the image is built, so `npm run build` uses the placeholder base
path `/__REPLACE_PUBLIC_URL__/` (see [`vite.config.mjs`](../../vite.config.mjs)),
and every URL the built files use for the app's own files (scripts, styles,
`config.js`, the favicon and manifest, lazily loaded code, images) starts
with it.

When the container starts, [`docker/entrypoint.sh`](../../docker/entrypoint.sh)
runs [`docker/set-base-path.mjs`](../../docker/set-base-path.mjs) before
starting `serve`. The script:

1. Evaluates `/app/config.js` and reads `window.env.PUBLIC_URL`.
2. Takes the URL's path, without a trailing slash: `/met-data-portal-pcds/app`
   for the URL above, or the empty string for an app at the root.
3. Replaces `/__REPLACE_PUBLIC_URL__` with that path in every `.html`, `.css`
   and `.js` file under `/app`, except `config.js`. The files are changed in
   place.

The container's log shows what it did:

```
set-base-path: PUBLIC_URL https://services.pacificclimate.org/met-data-portal-pcds/app/ -> base path "/met-data-portal-pcds/app"
set-base-path: index.html: 5 replaced
set-base-path: assets/index-<hash>.js: 2 replaced
set-base-path: 7 replaced in total
```

The container exits, and `serve` never starts, when:

- `config.js` can't be evaluated, or doesn't set `window.env.PUBLIC_URL`;
- `PUBLIC_URL` isn't an absolute `http://` or `https://` URL;
- no placeholder is found, which means the image wasn't built by
  `npm run build`.

Each failure logs a line starting with `set-base-path:` that says which.

**Changing `PUBLIC_URL` needs a new container, not a restart.** Because the
files are rewritten in place, a restarted container has no placeholder left.
A restart with the same `PUBLIC_URL` logs
`set-base-path: already applied (container restart)` and serves as before. A
restart with a different `PUBLIC_URL` fails, saying to recreate the
container. Recreate it with `docker compose up --force-recreate` (which
`npm run docker:up` does) or by removing and running it again.

The services.pacificclimate.org proxy strips the app's path before it
reaches the container, so the container sees the same paths at any
`PUBLIC_URL`. Only the URLs in the files it sends need the path.

### Deployment

See the contents of the [`docker`](../../docker) directory for an example of how
to run the SDP Docker image. The `docker:*` scripts in
[`package.json`](../../package.json) show how to run the image using
`docker compose`. You may wish to copy and modify
`docker-compose.yaml` to construct a production deployment.

Note: All **deployment configuration** is provided by
`docker/docker-compose.yaml` via the `/app/config.js` file mount. The app's
version is the only value fixed in the image (see
[configuration](./configuration.md#build-time-values)).

### Testing a deployment

The portal specs in
[pacificclimate/e2e-tests](https://github.com/pacificclimate/e2e-tests)
(private) check a deployed portal at its path: the map page, a hard refresh
on a preview page, and that the page's own files (styles, favicon,
manifest, `config.js`) load from under the app's path.

To check a branch before it merges, deploy its image to beehive (the
[Docker publishing workflow](../../.github/workflows/docker-publish.yml)
tags each branch's image with the branch name), then run both portal specs
against beehive from an e2e-tests checkout:

```bash
ENV_TARGET=beehive npx playwright test tests/met-data-portal-pcds tests/met-data-portal-ynwt --grep-invert "version displayed"
```

This runs both portals in all three browsers. The version test is left
out because it expects a particular release's version string.

For runs against a local build at the root, see
[development](./development.md#run-the-end-to-end-tests-locally).
