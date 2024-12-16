# Development and testing

## Run app locally

```bash
npm start
```

This starts the app with environment variables taken from local `.env` files. Generally env variables should be avoided
In favour of values being placed in the `public/config.js` file as these values are pulled when the code
is built. Brief summary:

- `.env`: Global default settings
- `.env.development`: Development-specific settings (`npm start`)
- `.env.production`: Production-specific settings (`npm run build`)

For more details, see the
[CRA documentation](https://facebook.github.io/create-react-app/docs/adding-custom-environment-variables).
Take special note of the `.env.*` file priorities when attempting to override for different build types.

For building and running a production app, see below.

## the PUBLIC_URL variable

In line with create react app this variable still needs to be set for correct working of application routers.
In development this will be set to the value in `.env.development` which should be set to the expected url while
executing `npm start`. Generally this will be `http://localhost:3000` by default.

For production (running `npm run build`) this will be set to `%REPLACE_PUBLIC_URL%` and allow the built
docker container to be able to set this at true run time. See `docker/entrypoint.sh` for the specifics
of this replace implementation.

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
deployment on a server. To do so:

1. Pull or build image.

   - To pull:

     ```
     docker pull pcic/station-data-portal-frontend:<tag>
     ```

     Typically `<tag>` is your current branch name.

   - To build:

     `make image`

     This automatically builds an image tagged with the current branch name.

2. Run container:

   `make up`

3. Stop and remove container:

   `make down`
