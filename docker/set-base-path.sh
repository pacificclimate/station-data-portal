#!/bin/sh
# Rewrites the build's placeholder base to the path the app is served at.
#
# The app is built under the base "/__REPLACE_PUBLIC_URL__/" (see
# vite.config.mjs), because its path isn't known until the container starts.
# This replaces "/__REPLACE_PUBLIC_URL__" in the built html, css and js with
# the pathname of PUBLIC_URL from the mounted config.js, without a trailing
# slash: "/met-data-portal-pcds/app", or "" when the app is served at root.
#
# The nginx image runs it from /docker-entrypoint.d/ before starting nginx.
# Exits non-zero, so the container doesn't start, if config.js has no valid
# PUBLIC_URL or nothing was replaced.
#
# The files are rewritten in place, so a restarted container finds no
# placeholder. The applied path is recorded in STAMP (outside the served
# directory), and a restart with the same PUBLIC_URL is a no-op.

set -eu

APP=/app
PLACEHOLDER=/__REPLACE_PUBLIC_URL__
CONFIG=config.js
STAMP=/tmp/base-path-applied

fail() {
  echo "set-base-path: $1" >&2
  exit 1
}

cd "$APP"

# config.js assigns window.env; PUBLIC_URL must be a quoted string on its own
# line, as in docker/config.*.js: `PUBLIC_URL: "https://host/path/",`.
[ -r "$CONFIG" ] || fail "can't read $CONFIG"
matches=$(sed -n \
  "s/^[[:space:]]*[\"']\{0,1\}PUBLIC_URL[\"']\{0,1\}[[:space:]]*:[[:space:]]*[\"']\([^\"']*\)[\"'].*/\1/p" \
  "$CONFIG")
case "$matches" in
  "") fail "$CONFIG doesn't set PUBLIC_URL as a quoted string on its own line" ;;
  *"
"*) fail "$CONFIG sets PUBLIC_URL more than once" ;;
esac
public_url=$matches

# The URL's pathname: drop the scheme and host, any query or fragment, and
# trailing slashes.
case "$public_url" in
  http://?* | https://?*) ;;
  *) fail "PUBLIC_URL isn't an absolute http(s) URL: \"$public_url\"" ;;
esac
rest=${public_url#*://}
rest=${rest%%[?#]*}
case "$rest" in
  /*) fail "PUBLIC_URL has no host: \"$public_url\"" ;;
  */*) base_path=/${rest#*/} ;;
  *) base_path= ;;
esac
while [ "${base_path%/}" != "$base_path" ]; do
  base_path=${base_path%/}
done
echo "set-base-path: PUBLIC_URL $public_url -> base path \"$base_path\""

# Escape the path for the right-hand side of a sed substitution.
replacement=$(printf '%s' "$base_path" | sed 's/[\\|&]/\\&/g')

total=0
for file in $(find . -type f ! -name "$CONFIG" \
  \( -name '*.html' -o -name '*.css' -o -name '*.js' \) | sort); do
  count=$(grep -o "$PLACEHOLDER" "$file" | wc -l)
  if [ "$count" -gt 0 ]; then
    sed -i "s|$PLACEHOLDER|$replacement|g" "$file"
    echo "set-base-path: ${file#./}: $count replaced"
    total=$((total + count))
  fi
done

if [ "$total" -gt 0 ]; then
  printf '%s' "$base_path" > "$STAMP"
  echo "set-base-path: $total replaced in total"
elif [ -f "$STAMP" ]; then
  applied=$(cat "$STAMP")
  if [ "$applied" != "$base_path" ]; then
    fail "already rewritten to \"$applied\" in this container; recreate it to change PUBLIC_URL"
  fi
  echo "set-base-path: already applied (container restart)"
else
  fail "no $PLACEHOLDER found in the built html, css or js"
fi
