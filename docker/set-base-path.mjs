// Rewrites the build's placeholder base to the path the app is served at.
//
// The app is built under the base "/__REPLACE_PUBLIC_URL__/" (see
// vite.config.mjs), because its path isn't known until the container starts.
// This replaces "/__REPLACE_PUBLIC_URL__" in the built html, css and js with
// the pathname of PUBLIC_URL from the mounted config.js, without a trailing
// slash: "/met-data-portal-pcds/app", or "" when the app is served at root.
//
// Run from the app directory by docker/entrypoint.sh. Exits non-zero, so the
// container doesn't start, if config.js has no valid PUBLIC_URL or nothing
// was replaced.
//
// The files are rewritten in place, so a restarted container finds no
// placeholder. The applied path is recorded in STAMP (outside the served
// directory), and a restart with the same PUBLIC_URL is a no-op.

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";

const PLACEHOLDER = "/__REPLACE_PUBLIC_URL__";
const EXTENSIONS = [".html", ".css", ".js"];
const CONFIG = "config.js";
const STAMP = "/tmp/base-path-applied";

const fail = (message) => {
  console.error(`set-base-path: ${message}`);
  process.exit(1);
};

// config.js assigns window.env; run it rather than pattern-match it.
const readPublicUrl = () => {
  const context = { window: {} };
  try {
    vm.runInNewContext(readFileSync(CONFIG, "utf8"), context);
  } catch (error) {
    fail(`can't evaluate ${CONFIG}: ${error.message}`);
  }
  const publicUrl = context.window.env?.PUBLIC_URL;
  if (typeof publicUrl !== "string") {
    fail(`${CONFIG} doesn't set window.env.PUBLIC_URL`);
  }
  return publicUrl;
};

const basePathOf = (publicUrl) => {
  let url;
  try {
    url = new URL(publicUrl);
  } catch {
    fail(`PUBLIC_URL isn't an absolute URL: ${JSON.stringify(publicUrl)}`);
  }
  if (!["http:", "https:"].includes(url.protocol)) {
    fail(`PUBLIC_URL isn't http(s): ${JSON.stringify(publicUrl)}`);
  }
  return url.pathname.replace(/\/+$/, "");
};

const builtFiles = (dir) =>
  readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name !== CONFIG &&
        EXTENSIONS.some((ext) => entry.name.endsWith(ext)),
    )
    .map((entry) => join(entry.parentPath, entry.name));

const publicUrl = readPublicUrl();
const basePath = basePathOf(publicUrl);
console.log(
  `set-base-path: PUBLIC_URL ${publicUrl} -> base path ${JSON.stringify(basePath)}`,
);

let total = 0;
for (const file of builtFiles(".")) {
  const content = readFileSync(file, "utf8");
  const count = content.split(PLACEHOLDER).length - 1;
  if (count > 0) {
    writeFileSync(file, content.replaceAll(PLACEHOLDER, basePath));
    console.log(`set-base-path: ${file}: ${count} replaced`);
    total += count;
  }
}

if (total > 0) {
  writeFileSync(STAMP, basePath);
  console.log(`set-base-path: ${total} replaced in total`);
} else if (existsSync(STAMP)) {
  const applied = readFileSync(STAMP, "utf8");
  if (applied !== basePath) {
    fail(
      `already rewritten to ${JSON.stringify(applied)} in this container; ` +
        `recreate it to change PUBLIC_URL`,
    );
  }
  console.log("set-base-path: already applied (container restart)");
} else {
  fail(`no ${PLACEHOLDER} found in the built html, css or js`);
}
