import React from "react";
import { Provider, Store, applyMiddleware, thunkMiddleware } from "./redux";
import renderer from 'react-test-renderer';
import reducer from "./reducers";
import App from "./App";

const message  = 'you never clicked'
const store = new Store({ message: {value: message } }, reducer, thunkMiddleware);

describe('Welcome', () => {
  it('Welcome renders hello world', () => {
    const app = renderer.create(<Provider store={store}>
      <App subtitle="Un good test" />
    </Provider>);
    expect(app.toJSON()).toMatchSnapshot()
  });
});
