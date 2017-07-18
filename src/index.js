import React from 'react';
import ReactDOM from 'react-dom';
import Rx from 'rxjs/Rx';
import R from 'ramda';

class Store {

  constructor(initState) {
    // create our stream as a subject so arbitrary data can be sent on the stream
    this.action$ = new Rx.Subject();

    // Redux reducer
    const reducer = (state, action) => action(state);

    // Reduxification
    this.store$ = this.action$
        .startWith(initState)
        .scan(reducer);
  }

  dispatch(action) {
    this.action$.next(action);
  }

  subscribe(rendererCallback) {
    this.store$.subscribe(rendererCallback);
  }
}

const store = new Store({ name: 'Johnny', async: [] });

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const fakeFetch = async () => {
  console.log('start fetching, it take 500 milliseconds');
  await wait(500);

  return {
      response: {
          status: 200
      }
  }
};

const actions = {
  updateNameStart: name => state => {
    fakeFetch().then(function(response) {
      if (response.status >= 400) {
        store.dispatch(actions.updateNameFailure('Impossible to add the name'))
      }
      store.dispatch(actions.updateNameSuccess(name))
    });

    return {
      ...state,
      loading: true,
      async: R.append('updateName', state.async)
    };
  },
  updateNameCancel: _ => state => {
    return {
      ...state,
      loading: false,
      async: R.remove('updateName', state.async)
    }
  },
  updateNameFailure: error => state => {
    return {
      ...state,
      loading: false,
      async: R.remove('updateName', state.async),
      error
    }
  },
  updateNameSuccess: name => state => {
    if (R.contains('updateName', state.async)) {
      return {
          ...state,
          loading: false,
          async: R.remove('updateName', state.async),
          name
      };
    }
    return state;
  }
};

// Example action function
const changeName = name => store.dispatch(actions.updateNameStart(name));
const cancel = name => store.dispatch(actions.updateNameCancel());

// React view component
const App = (props) => {
  const { name } = props;
  return (
    <div>
      <h1>{ name }</h1>
      <button onClick={() => changeName('Harry')} >Harry</button>
      <button onClick={() => changeName('Sally')} >Sally</button>
      <button onClick={() => cancel()} >Cancel</button>
    </div>
  );
};

// subscribe and render the view
const dom =  document.getElementById('root');
store.subscribe(state => ReactDOM.render(<App {...state} />, dom));
