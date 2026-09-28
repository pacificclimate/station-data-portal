#!/bin/bash
set -euo pipefail

# Point the built files at the path the app is served at, taken from
# PUBLIC_URL in the mounted config.js. See docker/set-base-path.mjs.
node docker/set-base-path.mjs

echo "node version: $(node -v)"
exec serve -s . -l 8080
