const { CracoAliasPlugin } = require("react-app-alias");

const options = {}; // default is empty for most cases

module.exports = {
  eslint: null,
  plugins: [
    {
      plugin: CracoAliasPlugin,
      options: {},
    },
  ],
  // Works around a warning that plotly.js doesn't have a source map
  // As warnings are treated as errors in the build, this is necessary
  // node_modules are generally external code so it is hard to fix the warning
  // and we can safely ignore sourcemap errors.
  webpack: {
    configure: {
      ignoreWarnings: [
        function ignoreSourcemapsloaderWarnings(warning) {
          return (
            warning.module &&
            warning.module.resource.includes("node_modules") &&
            warning.details &&
            warning.details.includes("source-map-loader")
          );
        },
      ],
    },
  },
};
