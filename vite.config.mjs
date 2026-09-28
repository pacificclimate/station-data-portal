import { execFileSync } from "node:child_process";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The version shown in the header: "TAG (BRANCH: SHA)", or "unknown" when git
// can't tell (no .git, no tags, or a shallow clone).
const gitVersion = () => {
  const git = (...args) =>
    execFileSync("git", args, { encoding: "utf8", stdio: "pipe" }).trim();
  try {
    const tag = git("describe", "--tags", "--abbrev=0");
    const branch = git("rev-parse", "--abbrev-ref", "HEAD");
    const sha = git("log", "-1", "--format=%h");
    return `${tag} (${branch}: ${sha})`;
  } catch {
    return "unknown";
  }
};

export default defineConfig(({ command }) => ({
  // The built app doesn't know its path until the container starts, so it's
  // built under a placeholder that docker/entrypoint.sh replaces with the
  // pathname of PUBLIC_URL (or the empty string at root). Dev serves at root.
  base: command === "build" ? "/__REPLACE_PUBLIC_URL__/" : "/",
  plugins: [react()],
  resolve: {
    alias: {
      // Mirrors the `@/*` paths entry in jsconfig.json, which editors read.
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  define: {
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(gitVersion()),
  },
  build: {
    // The oldest browsers matched by CRA's former browserslist query
    // (">0.2%, not dead, not op_mini all") as of 2026-09.
    target: ["chrome109", "edge119", "firefox120", "safari15.6", "ios15.6"],
    sourcemap: true,
    rolldownOptions: {
      output: {
        // Keep licence notices (Vite 8.3 already does; this pins it).
        comments: { legal: true },
      },
    },
  },
  server: {
    port: 3000,
    strictPort: true,
  },
  test: {
    environment: "jsdom",
    // Only unit tests under src/. Without this, Vitest's default glob also
    // picks up the Playwright specs kept under docs/.
    include: ["src/**/*.test.{js,jsx}"],
    setupFiles: ["./vitest.setup.js"],
    // Measured (`npm run test:coverage`), never gated: no thresholds.
    coverage: {
      include: ["src/**/*.{js,jsx}"],
      exclude: ["src/test-utils.jsx", "src/**/*-driver.js"],
    },
  },
}));
