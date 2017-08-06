import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, Store, thunkMiddleware } from './redux';
import reducer from './reducer';
import App from './App';

const store = new Store({ name: 'Johnny' }, reducer, thunkMiddleware);

const dom =  document.getElementById('root');
ReactDOM.render(<Provider store={ store }><App subtitle="Un good test"></App></Provider>, dom);
