import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

// For now this config exists to drive Vitest; the app is still built by
// craco/react-scripts. The build-side settings (base path, output directory,
// plugins) land with the rest of the Vite migration.
export default defineConfig({
  resolve: {
    alias: {
      // Mirrors the `@/*` paths entry in jsconfig.json, which react-app-alias
      // reads for the craco build. The two must agree until craco is retired.
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    // Only unit tests under src/. Without this, Vitest's default glob also
    // picks up the Playwright specs kept under docs/.
    include: ["src/**/*.test.{js,jsx}"],
    setupFiles: "./vitest.setup.js",
    // Measured (`npm run test:coverage`), never gated: no thresholds.
    coverage: {
      include: ["src/**/*.{js,jsx}"],
      exclude: ["src/test-utils.jsx", "src/**/*-driver.js"],
    },
    alias: {
      // react-leaflet-draw's CJS `main` bundles a private copy of
      // @react-leaflet/core, whose context never matches react-leaflet's.
      // Point tests at its ESM `module` build, which webpack picks for the app.
      "react-leaflet-draw": fileURLToPath(
        new URL(
          "./node_modules/react-leaflet-draw/dist/esm/index.js",
          import.meta.url,
        ),
      ),
    },
  },
});
