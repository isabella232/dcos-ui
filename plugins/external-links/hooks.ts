import { Hooks } from "PluginSDK";

module.exports = {
  filters: ["applicationConfiguration"],

  initialize() {
    this.filters.forEach((filter) => {
      Hooks.addFilter(filter, this[filter].bind(this));
    });
  },

  applicationConfiguration(configuration) {
    configuration.documentationURI = "https://docs.mesosphere.com";
    configuration.downloadsURI = "https://downloads.mesosphere.com";
    configuration.productHomepageURI = "https://mesosphere.com";
    configuration.supportEmail = "support@mesosphere.com";

    return configuration;
  },
};
