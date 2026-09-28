# Development and testing

## Run app locally

```bash
npm start
```

This starts Vite's development server at http://localhost:3000. Edits under
`src/` show up in the browser without a reload.

The app's configuration comes from `public/config.js`, not from environment
variables. See [configuration](./configuration.md) for the options, and
[build](./build.md) for how local runs differ from Docker ones.

## Upgrading `pcic-react-leaflet-components`

To get a successful upgrade in your local environment, you must do the
following:

```bash
npm uninstall pcic-react-leaflet-components
npm install git+https://github.com/pacificclimate/pcic-react-leaflet-components.git#<version>
```

## Testing

Testing (unit) is sparse in this project. I'm still debating how much effort
it is worth putting into tests of React components in a non-library/package
project, but in this case the answer has come down to: very little. As always
test setup is very effortful, and I don't see the payoff here.

That said, there are some unit tests scattered throughout the code. The most
useful and important ones are those in `src/data-services` and `src/utils`.

### Run tests locally

Unit tests run with [Vitest](https://vitest.dev/), configured in the `test`
block of [`vite.config.mjs`](../../vite.config.mjs). Test files sit next to
the code they test and are named `*.test.js` or `*.test.jsx`.

```bash
npm test            # run once
npm run test:watch  # rerun on change
```

Tests run in jsdom, with Jest-style globals (`describe`, `it`, `expect`), so
test files don't import them. Components that need the app's contexts or a
Leaflet map can be rendered with `renderWithProviders` from
[`src/test-utils.jsx`](../../src/test-utils.jsx).

Component logging is on in local test runs. It is off when `CI` is set,
unless `CI=log` (see [`vitest.setup.js`](../../vitest.setup.js)).

Tests are also automatically run by a GitHub action on each commit, along
with `npm run build` and `npm run check-format`.

### Test Docker infrastructure

It can be useful to test the Docker infrastructure locally before
deployment on a server. The `docker:*` npm scripts wrap
[`docker/docker-compose.yaml`](../../docker/docker-compose.yaml), which mounts
`docker/config.bc.js` as the container's `config.js`. To do so:

1. Build or pull an image.

   - To build from your working tree:

     ```bash
     npm run docker:build
     ```

     This runs `npm run build`, then builds an image tagged
     `pcic/station-data-portal-frontend:local`. Rerun it after code changes;
     `docker:up` doesn't rebuild.

   - To pull a published image:

     ```bash
     SDP_TAG=<tag> docker compose -f docker/docker-compose.yaml pull
     ```

     `<tag>` is a branch name or release version, as published by the
     [Docker publishing workflow](../../.github/workflows/docker-publish.yml).

2. Run the container at http://localhost:30503:

   ```bash
   npm run docker:up
   ```

   For a pulled image, run `SDP_TAG=<tag> npm run docker:up`. The container
   runs in the foreground; Ctrl-C stops it. To use another host port, set
   `SDP_PORT` and change `PUBLIC_URL` in `docker/config.bc.js` to match.

3. Remove the container:

   ```bash
   npm run docker:down
   ```

### Run the end-to-end tests locally

The browser tests for the deployed portals live in
[pacificclimate/e2e-tests](https://github.com/pacificclimate/e2e-tests)
(private). Their portal specs can also run against a local copy of the app:
set `BASE_URL` to the app's full URL, and they test that instead of a
deployment. With `BASE_URL` set, the version and backend-health tests are
skipped, so a passing run reports 2 skipped.

From an e2e-tests checkout, with the app running locally:

- Against `npm start`, while developing:

  ```bash
  BASE_URL=http://localhost:3000/ npx playwright test tests/met-data-portal-pcds --project=chromium
  ```

- Against the Docker image (`npm run docker:build`, then `npm run docker:up`):

  ```bash
  BASE_URL=http://localhost:30503/ npx playwright test tests/met-data-portal-pcds --project=chromium
  ```

  This is the one that checks a production build: only the container
  rewrites the build's base path (see
  [production](./production.md#base-path-rewrite-at-container-start)).

Use `localhost`, not `127.0.0.1`, to match `PUBLIC_URL` in the local
configs.

Both local targets serve the app at the root. To test a deployment at its
subpath, see [production](./production.md#testing-a-deployment).
