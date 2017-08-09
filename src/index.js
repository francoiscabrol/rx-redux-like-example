import React from "react";
import ReactDOM from "react-dom";
import { Provider, Store, applyMiddleware, thunkMiddleware } from "./redux";
import reducer from "./reducer";
import App from "./App";

const logger = ({ getState }) => next => action => {
  console.groupCollapsed("dispatching action " + action.type);
  console.log("action", action);
  let result = next(action);
  console.log("next state", getState());
  console.groupEnd();
  return result;
};

const middlewares = applyMiddleware(thunkMiddleware, logger);

const store = new Store({ name: "Johnny" }, reducer, middlewares);

const dom = document.getElementById("root");
ReactDOM.render(
  <Provider store={store}>
    <App subtitle="Un good test" />
  </Provider>,
  dom
);
