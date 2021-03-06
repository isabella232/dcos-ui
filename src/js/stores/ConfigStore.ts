import PluginSDK from "PluginSDK";

import {
  REQUEST_CLUSTER_CCID_ERROR,
  REQUEST_CLUSTER_CCID_SUCCESS,
  REQUEST_CONFIG_ERROR,
  REQUEST_CONFIG_SUCCESS,
} from "../constants/ActionTypes";
import AppDispatcher from "../events/AppDispatcher";
import ConfigActions from "../events/ConfigActions";
import {
  APP_STORE_CHANGE,
  CLUSTER_CCID_ERROR,
  CLUSTER_CCID_SUCCESS,
  CONFIG_ERROR,
  CONFIG_LOADED,
} from "../constants/EventTypes";
import GetSetBaseStore from "./GetSetBaseStore";

class ConfigStore extends GetSetBaseStore<{ ccid: unknown; config: unknown }> {
  fetchConfig = ConfigActions.fetchConfig;
  fetchCCID = ConfigActions.fetchCCID;
  storeID = "config";

  constructor() {
    super();

    this.getSet_data = {
      ccid: {},
      config: null,
    };

    PluginSDK.addStoreConfig({
      store: this,
      storeID: this.storeID,
      events: {
        success: CONFIG_LOADED,
        error: CONFIG_ERROR,
        ccidSuccess: CLUSTER_CCID_SUCCESS,
        ccidError: CLUSTER_CCID_ERROR,
      },
      unmountWhen: () => false,
    });

    AppDispatcher.register((payload) => {
      const action = payload.action;
      switch (action.type) {
        case REQUEST_CONFIG_SUCCESS:
          this.processConfigSuccess(action.data);
          break;
        case REQUEST_CONFIG_ERROR:
          this.emit(CONFIG_ERROR);
          break;
        case REQUEST_CLUSTER_CCID_SUCCESS:
          this.processCCIDSuccess(action.data);
          break;
        case REQUEST_CLUSTER_CCID_ERROR:
          this.emit(CLUSTER_CCID_ERROR);
          break;
      }

      return true;
    });
  }

  set(config) {
    super.set(config);

    // Dispatch new Store data
    PluginSDK.dispatch({
      type: APP_STORE_CHANGE,
      storeID: this.storeID,
      data: this.getSet_data,
    });
  }

  addChangeListener(eventName, callback) {
    this.on(eventName, callback);
  }

  removeChangeListener(eventName, callback) {
    this.removeListener(eventName, callback);
  }

  processConfigSuccess(config) {
    this.set({ config });
    this.emit(CONFIG_LOADED);
  }

  processCCIDSuccess(ccid) {
    this.set({ ccid });
    this.emit(CLUSTER_CCID_SUCCESS);
  }
}

export default new ConfigStore();
