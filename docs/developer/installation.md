# Installation

## Tooling

Your Node.js tooling must satisfy the following version requirements:

- `npm` >= 8.1.0
- `node` >= 16

## Install

With the appropriate versions of `node`/`npm` in use:

```bash
npm install
```

If you need to start fresh after much messing about, the `reinstall` script
deletes `./node_modules/` and then installs:

```bash
npm run reinstall
```

## Notes

There are complications in the current dependencies of this application that
are worth documenting.

### React Leaflet 3.x

We are presently using [React Leaflet 3.x](https://react-leaflet.js.org/docs/v3/start-introduction/). It is already marked as
"no longer maintained", but it is still a documented release (unlike RL 2.x).
We may decide to upgrade to RL 4.x, but we're taking this one step at a time.

React Leaflet 3.x poses some installation problems, as documented in
[`pcic-react-leaflet-components` 2.x](https://github.com/pacificclimate/pcic-react-leaflet-components/blob/master/docs/installation.md#dependencies).
For reference, see [this issue](https://github.com/PaulLeCam/react-leaflet/issues/891);
particularly,
[this comment](https://github.com/PaulLeCam/react-leaflet/issues/891#issuecomment-924374035).

We have adopted the base installation documented for
`pcic-react-leaflet-components` 2.x. Specifically, it pins the following
dependencies:

```json
"leaflet": "^1.7.1",
"react": "^17.0.2",
"react-dom": "^17.0.2",
"@react-leaflet/core": "1.0.2",
"react-leaflet": "3.1.0"
```

### React Leaflet Draw

[React Leaflet Draw](https://github.com/alex3165/react-leaflet-draw#readme)
provides the tools for a user to draw a polygon on the map.

The peer dependency specification in its `package.json` states that its
latest release, 0.19.8, is _not_ compatible with React Leaflet 3.x and React 17,
but that, fortunately, is false.

For reference:

- RLD was [updated to react-leaflet@3.0.0 in some release prior to 0.19.8](https://github.com/alex3165/react-leaflet-draw/pull/90)
- The peer dependency declaration appears to be buggy (still requiring
  react-leaflet@2), causing installation fails:
  - https://github.com/alex3165/react-leaflet-draw/issues/100
  - https://github.com/alex3165/react-leaflet-draw/pull/116

To overcome the false error messages, it was installed with
`npm install --save --force react-leaflet-draw`. The effect of `--force` is
to treat the errors in this particular install as warnings. The result is
enshrined in `package-lock.json` and the application can be installed as
usual (no `--force`) when this `package-lock.json` is present.
