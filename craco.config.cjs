const path = require("path");

// use some aliases to help reduce the ../../../ in our imports and make it more
// obvious where stuff is coming from. Note that for intellisense to work these should
// be mirrored in jsconfig.json

module.exports = {
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
};
