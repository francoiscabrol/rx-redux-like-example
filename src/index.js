import React from "react";
import ReactDOM from "react-dom";
import { Provider, Store, applyMiddleware, thunkMiddleware, createThunkActionMiddleware } from "./redux";
import reducer from "./reducer";
import thunkActions from './thunkActions';
import App from "./App";

const logger = ({ getState }) => next => action => {
  console.groupCollapsed("dispatching action " + action.type);
  console.log("action", action);
  let result = next(action);
  console.log("next state", getState());
  console.groupEnd();
  return result;
};

const thunkActionMiddleware = createThunkActionMiddleware(thunkActions);

const middlewares = applyMiddleware(thunkActionMiddleware, thunkMiddleware, logger);

const store = new Store({ name: "Johnny" }, reducer, middlewares);

const dom = document.getElementById("root");
ReactDOM.render(
  <Provider store={store}>
    <App subtitle="Un good test" />
  </Provider>,
  dom
);
