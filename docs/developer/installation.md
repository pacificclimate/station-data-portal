# Installation

## Tooling

Your Node.js tooling must match the `engines` field in
[`package.json`](../../package.json):

- `node` 24.x
- `npm` 12.x

The [devcontainer](../../.devcontainer) sets up both.

## Install

With the appropriate versions of `node`/`npm` in use:

```bash
npm ci
```

`npm ci` installs exactly what `package-lock.json` records. Use
`npm install` only to add or change a dependency.

If you need to start fresh after much messing about, the `reinstall` script
does the same thing (`npm ci` deletes `./node_modules/` before installing):

```bash
npm run reinstall
```

## Dependency policy

[`.npmrc`](../../.npmrc) sets a security policy that npm 12 enforces on every
install:

- `min-release-age=7`: npm won't install a package version published less
  than 7 days ago. If `npm install` refuses a new release, take the previous
  version rather than overriding the policy. `npm ci` from an existing
  lockfile isn't affected.
- `strict-allow-scripts=true`: an install fails if a dependency has an
  install script that the `allowScripts` field in `package.json` doesn't
  mention. Review the script, then add the package there with `true` to run
  it or `false` to skip it.
- `allow-git=root` and `allow-remote=none`: git dependencies may be declared
  only in this project's own `package.json` (as
  `pcic-react-leaflet-components` is), and no dependency may come from a
  tarball URL outside the npm registry.

## Notes

`pcic-react-leaflet-components` is installed from a git tag. See
[development](./development.md#upgrading-pcic-react-leaflet-components) for
how to upgrade it.
