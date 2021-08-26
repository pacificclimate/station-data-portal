# Station Data Portal

Frontend for visualizing and selecting stations, and downloading station data from a 
[PyCDS](https://github.com/pacificclimate/pycds) / CRMP schema database. 

The corresponding backend data services are,
* [Station Data Portal Backend](https://github.com/pacificclimate/station-data-portal-backend): provides all metadata
* PCDS Data Download Backend: provides station data (TBD)

This frontend is modelled on (and a feature superset of) the existing 
[PCDS](https://data.pacificclimate.org/portal/pcds/map/) data portal, 
but built in React and with a more modern and flexible UI. 

Since the backends work with any PyCDS schema database, this application can replace PCDS 
simply by being pointed at backends connected to the CRMP database.

## Requirements

Node.js >= 9.2.0 (**important**)

All other package requirements are specified in `package.json`.

We **strongly** recommend using [`nvm`](https://github.com/creationix/nvm) to manage your `node`/`npm` install.
In particular, you will have trouble finding later versions of Node.js in standard Linux installs;
`nvm` however is up to date with all recent releases.

Note: Avoid `snap` packages. Experience to date suggests it does not result in stable, reliable installations.

## Configuration

### Environment variables

Main configuration of the Climate Explorer frontend is done via environment variables.

In a Create React App app, [environment variables are managed carefully](https://facebook.github.io/create-react-app/docs/adding-custom-environment-variables).
Therefore, most of the environment variables below begin with `REACT_APP_`, as required by CRA.

CRA also provides a convenient system for setting default values of environment variables
in various contexts (development, production, etc.).

Brief summary:

* `.env`: Global default settings
* `.env.development`: Development-specific settings (`npm start`)
* `.env.production`: Production-specific settings (`npm run build`)

For more details, see the
[CRA documentation](https://facebook.github.io/create-react-app/docs/adding-custom-environment-variables).

Environment variables for configuring the app are:

`PUBLIC_URL`
- Base URL for Station Data Portal frontend.
- For production, set this to the URL configured in our proxy server.

`REACT_APP_VERSION`
- Current version of the app.
- This value should be set using `generate-commitish.sh` when the Docker image is built (see below).
- It is not recommended to manually override the automatically generated value when the image is run.
- No default value for this variable is provided in any `.env` file.

`REACT_APP_SDS_URL`
- URL for station data portal backend (Station Data Service; SDS).

`REACT_APP_PDP_DATA_URL`
- URL for PDP PCDS data download service. 

`REACT_APP_BASE_MAP`
- Selects which base map (and thus which projection) to use for station 
  map. Valid values:
  - `BC`: BC OSM Lite (or similar) base map; BC Albers projection.
  - `YNWT`: YNWT OSM Lite (or similar) base map; Yukon Albers projection.
  
`REACT_APP_BC_BASE_MAP_TILES_URL`
- URL template (includes x, y, z) for BC base map tiles.
- Required only if `REACT_APP_BASE_MAP=BC`

`REACT_APP_YNWT_BASE_MAP_TILES_URL`
- URL template (includes x, y, z) for YNWT base map tiles.
- Required only if `REACT_APP_BASE_MAP=YNWT`

## Installation

You **must** use a version of `npm` >= 5.5.1. This version of `npm` comes with `node` 9.2.0.
If you are using nvm, then run `nvm use 9.2.0` (or higher; ver 11.13 works fine too).

(`npm` 5.5.1 / `node` 9.2.0 is known to work; `npm` 3.5.2 / `node` 8.10.0 is known to fail to install certain required dependencies.
Intermediate versions may or may not work.)

With the appropriate versions of `node`/`npm` in use:

```bash
npm install
```

If you need to start fresh after much messing about, the `reinstall` script
deletes `./node_modules/` and then installs:

```bash
npm run reinstall
```

### Running (dev environment)

```bash
npm start
```

For building a production app, see below.

### Testing

```bash
npm test
```

## Production

### Notes

#### Configuration, environment variables, and Docker

It is best practice to configure a web app externally, at run-time, typically using environment variables for any
simple (atomic, e.g., string) configuration values.

Here we run into a problem introduced by CRA:
CRA injects environment variables only at _build time_, not at run time.
["The environment variables are embedded during the build time. Since Create React App produces a static
HTML/CSS/JS bundle, it can’t possibly read them at runtime."](https://facebook.github.io/create-react-app/docs/adding-custom-environment-variables).

We containerize our apps with Docker. A natural approach to deploying apps with Docker is to build the app as
part of the image build, and then just serve it from a container. However, because of CRA's build-time injection
of environment variables, this means that such Docker images cannot be configured at run-time, that is, when
a container is run. Only static, build-time environment variables are available to CRA apps inside such images.

It therefore takes some extra effort to inject run-time environment variables (or configuration generally) into
these Dockerized applications. There are two basic approaches:

1. Build the app, and inject run-time environment variables, as part of the image run (i.e., the command run
by the image includes building the app, which then has access to environment variables provided via the `docker run`
command).
    * This is simple but it means that containers are slow to start up and contain a lot of infrastructure
    (Node.js, etc.) needed to build the image. This isn't an issue for us, because we don't start many instances and
    we don't do it often.

2. Fetch the environment variables (or a configuration file) from the server.
    * This approach has several variants, which are outlined in this
    [CRA issue](https://github.com/facebook/create-react-app/issues/2353).

A key requirement is to be able to configure at run time the the URL at which the app is deployed.
CRA provides a (build-time) environment variable for this, `PUBLIC_URL`.

Option 2 makes setting `PUBLIC_URL` _much_ harder to accomplish, and would require significant changes to the
codebase.

Option 1 makes setting `PUBLIC_URL` simple and requires no change to the codebase;
as noted we don't care about the cost of using such containers.

Therefore we have chosen option 1.

### Setup using Docker

We use Docker for production deployment.

It can also be useful in development; for example, to test a proposed volume mounting for the container.

#### Build docker image manually

Until recently (roughly, Jan 2019), we were using Dockerhub automated builds
to build our images. Dockerhub recently changed their UI and in doing so broke
all the automated builds. For the moment we need to do manual builds.

Dockerhub images all had the prefix `pcic/`.

To distinguish our manually built images, we are omitting the `pcic/` prefix and just using `station-data-portal`.

Build a docker image:

```bash
docker build -t station-data-portal \
    --build-arg REACT_APP_VERSION="$(./generate-commitish.sh)" .
```

Setting build arg `REACT_APP_VERSION` as above is the most reliable
way to inject an accurate version into the final app. This value can be overridden
when the image is run, but it is not recommended, as it introduces the possibility
of error.

#### Tag docker image

Dockerhub automatically assigned the tag `latest` to the latest build.
That was convenient, but ...

For manual build procedures,
[tagging with `latest` is not considered a good idea](https://medium.com/@mccode/the-misunderstood-docker-tag-latest-af3babfd6375).
It is better (and easy and immediately obvious) to tag with version/release
numbers. In this example, we will tag with version 1.2.3.

1. Determine the recently built image's ID:

   ```bash
   $ docker images
   REPOSITORY                                                         TAG                 IMAGE ID            CREATED             SIZE
   station-data-portal                                                latest              14cb66d3d145        22 seconds ago      867MB

   ```

1. Tag the image:

   ```bash
   Tag the image
   $ docker tag 1040e7f07e5d docker-registry01.pcic.uvic.ca:5000/station-data-portal:1.2.3
   ```

#### Push docker image to PCIC docker registry

[PCIC maintains its own docker registry](https://pcic.uvic.ca/confluence/pages/viewpage.action?pageId=3506599). 
We place manual builds in this registry:

```bash
docker push docker-registry01.pcic.uvic.ca:5000/station-data-portal:1.2.3
```

#### Run docker image

As described above, environment variables configure the app.
All are given standard development and production values in the files
`.env`, `.env.development`, and `.env.production`.

These can be overridden at run time by providing them in the `docker run` command (`-e` option).

In addition, we mount the configuration files as volumes in the container.
This enables us to update these files without rebuilding or redeploying the app.
See the section below for details.

Typical production run:

```bash
docker run --restart=unless-stopped -d
  -e PUBLIC_URL=<deployment url, including base path>
  -e <other env variable>=<value>
  -p <external port>:8080
  --name station-data-portal
  station-data-portal:<tag>
```

## Releasing

Creating a versioned release involves:

1. Incrementing `version` in `package.json`
2. Summarize the changes from the last version in `NEWS.md`
3. Commit these changes, then tag the release:

  ```bash
git add package.json NEWS.md
git commit -m"Bump to version x.x.x"
git tag -a -m"x.x.x" x.x.x
git push --follow-tags
  ```

## [Project initialization](docs/Project-initialization.md)
