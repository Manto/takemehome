import React from "react";
import ReactDOM from "react-dom";
import { observable, useStrict } from "mobx";
import makeInspectable from "mobx-devtools-mst";
import { Provider } from "mobx-react";

import "./index.css";

import App from "./App";
import { LevelStore } from "./stores/LevelStore";

import registerServiceWorker from "./registerServiceWorker";

useStrict(true);

const levelStore = LevelStore.create({
  width: 0,
  height: 0,
  grids: [],
  items: [],
  characters: []
});

makeInspectable(levelStore);

const history = {
  snapshots: observable.shallowArray(),
  actions: observable.shallowArray(),
  patches: observable.shallowArray()
};

const stores = {
  levelStore,
  history
};

// For easier debugging
window._____APP_STATE_____ = stores;

ReactDOM.render(
  <Provider {...stores}>
    <App />
  </Provider>,
  document.getElementById("root")
);

registerServiceWorker();
