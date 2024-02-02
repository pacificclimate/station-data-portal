import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import license from "rollup-plugin-license";

export default defineConfig({
  // depending on your application, base can also be "/"
  base: "",
  plugins: [
    react(),
    license({
      thirdParty: {
        output: path.join(__dirname, "dist", "dependencies.txt"),
        includePrivate: true, // Default is false.
      },
    }),
  ],
  define: {
    "process.env": {
      REACT_APP_BC_BASE_MAP_TILES_URL:
        "https://services.pacificclimate.org/tiles/bc-albers-lite/{z}/{x}/{y}.png",
      REACT_APP_YNWT_BASE_MAP_TILES_URL:
        "https://services.pacificclimate.org/tiles/yukon-albers-lite/{z}/{x}/{y}.png",
    },
  },
  server: {
    // this ensures that the browser opens upon server start
    open: true,
    // this sets a default port to 3000
    port: 3000,
  },
  build: {
    rollupOptions: {
      output: {
        dir: "build",
      },
    },
  },
});
