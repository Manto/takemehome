const rewireMobX = require("react-app-rewire-mobx");
var path = require("path");

/* config-overrides.js */
module.exports = function override(config, env) {
  config = rewireMobX(config, env);

  if (!config.resolve) {
    config.resolve = {};
  }
  if (!config.resolve.alias) {
    config.resolve.alias = {};
  }
  config.resolve.alias.Components = path.resolve(__dirname, "src/components/");
  config.resolve.alias.Stores = path.resolve(__dirname, "src/stores/");
  config.resolve.alias.Utils = path.resolve(__dirname, "src/utils/");
  return config;
};
