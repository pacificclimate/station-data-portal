# Building the project

The app is built with [Vite](https://vite.dev/), configured in
[`vite.config.mjs`](../../vite.config.mjs). There are 3 modes of operation for
the application which take slightly different build steps:

### Local

Everything in the project should be set up for easy development with defaults provided that allow
execution without modification to configuration. This execution is done via `npm start`, which
starts Vite's development server at http://localhost:3000 with hot module replacement. Nothing is
bundled ahead of time; Vite serves the source files directly. If port 3000 is taken, `npm start`
fails rather than picking another port.

Local config is provided via [public/config.js](../../public/config.js) and is loaded automatically
as a static javascript file via the local development server. It is read once when the page loads,
so reload the page after editing it.

The development server always serves the app at the root of `localhost:3000`.

### Local Docker

Testing for deployment involves building in production mode and setting up a container as we will
in production. This allows us to ensure that dependencies are met and gives us a portable artifact
that we can set up on any docker capable machine and expect to work.

Creating the image can be done via `npm run docker:build`. This command executes `npm run build`
creating a static version of the website in the `dist/` folder. Values that are fixed at build time
(see [configuration](./configuration.md#build-time-values)) are baked into these files, so they
should not be used for environment specific configuration. Once built the
[Dockerfile](../../docker/Dockerfile) copies `dist/` into a docker image, tagged
`pcic/station-data-portal-frontend:local`.

`npm run build` also writes source maps next to the JavaScript in `dist/assets/`.

Running the created docker image can be done via `npm run docker:up`, and removing the container via
`npm run docker:down`. See [development](./development.md#test-docker-infrastructure) for running a
published image instead. `docker:up` brings up the image based on the
specification in the [docker-compose.yaml](../../docker/docker-compose.yaml). This specification also
overrides our local development configuration values by mounting an alternative configuration. Two examples
are provided `config.bc.js` and `config.ynwt.js` representing our two common production versions. `bc`
is used by default.

`PUBLIC_URL` is handled in two steps. `npm run build` builds the app under the placeholder base path
`/__REPLACE_PUBLIC_URL__/`, so every URL the built files use for the app's own files starts with it.
When the container starts, it replaces the placeholder with the path of the `PUBLIC_URL` value in
`/app/config.js`. See [production](./production.md#base-path-rewrite-at-container-start) for
the details. Because of this placeholder, the contents of `dist/` only work once they're inside the
container.

### Production Docker

Production docker essentially follows the same steps as above (what good would a local test be otherwise!)
but is executed via a github workflow. The resulting image is uploaded to our
[docker hub](https://registry.hub.docker.com/r/pcic/station-data-portal-frontend) for use where desired.

Specific steps are defined in the [github workflow](../../.github/workflows/docker-publish.yml) file.

When running in production we need to provide environment specific config, this config will closely
resemble the templates defined in the `config.bc.js` and `config.ynwt.js` files noted above and should be
mounted to `/app/config.js` within the container.
