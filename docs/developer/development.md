# Development and testing

## Run app locally

```bash
npm start
```

This starts the app with environment variables taken from local `.env` files. Generally env variables should be avoided
In favour of values being placed in the `public/config.js` file as these values are pulled when the code
is built. See [configuration](./configuration.md) for more details.

## Upgrading `pcic-react-leaflet-components`

To get a successful upgrade in your local environment, you must do the
following:

```
npm uninstall pcic-react-leaflet-components
npm install git+https://git@github.com/pacificclimate/pcic-react-leaflet-components.git#<version>
```

## Testing

Testing (unit) is sparse in this project. I'm still debating how much effort
it is worth putting into tests of React components in a non-library/package
project, but in this case the answer has come down to: very little. As always
test setup is very effortful, and I don't see the payoff here.

That said, there are some unit tests scattered throughout the code. The most
useful and important ones are those in `src/data-services` and `src/utils`.

### Run tests locally

```bash
npm test
```

Tests are also automatically run by a GitHub action on each commit.

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
