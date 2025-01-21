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
