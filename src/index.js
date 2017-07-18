import React from 'react';
import ReactDOM from 'react-dom';
import Rx from 'rxjs/Rx';

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

const store = new Store({ name: 'Johnny' });

const fakeFetch = async () => {
  console.log('start fetching');
  return {
    response: {
      status: 200
    }
  }
};

function cancelable(action) {
  const uuid = Random.nextInt();
  return state => {
    action({...state, async: R.add(id, state.async)}, () => { return R.contains(id, state.async); });
    return uuid;
  }
}

const actions = {
  updateNameStart: name => cancelable((state, isCancel) => {
    fakeFetch().then(function(response) {
      if (response.status >= 400) {
        store.dispatch(actions.updateNameFailure('Impossible to add the name'))
      }
      if (isCancel()) {
        store.dispatch(actions.updateNameSuccess(name))
      }
    });

    return {
      ...state,
      loading: true
    };
  }),
  cancelAsyncAction: id => state => {
    return {
      ...state,
      async: R.omit(id, state.async),
      error
    }
  },
  updateNameFailure: error => state => {
    return {
      ...state,
      loading: false,
      error
    }
  },
  updateNameSuccess: name => state => {
    return {
      ...state,
      loading: false,
      name
    };
  }
};

// Example action function
const changeName = name => store.dispatch(actions.updateNameStart(name));

// React view component
const App = (props) => {
  const { name } = props;
  return (
    <div>
      <h1>{ name }</h1>
      <button onClick={() => changeName('Harry')} >Harry</button>
      <button onClick={() => changeName('Sally')} >Sally</button>
    </div>
  );
};

// subscribe and render the view
const dom =  document.getElementById('root');
store.subscribe(state => ReactDOM.render(<App {...state} />, dom));
