import React from 'react';
import ReactDOM from 'react-dom';
import Rx from 'rxjs/Rx';
import { Provider, connect, Store, thunkMiddleware } from './redux';

// Redux reducer
const reducer = (state, action) => {
  console.log('Action:', action)
  switch(action.type) {
    case 'UPDATE_NAME_START': {
      return {
        ...state,
        loading: true
      };
    }
    case 'UPDATE_NAME_FAILURE': {
      return {
        ...state,
        loading: false,
        error: action.error
      }
    }
    case 'UPDATE_NAME_SUCCESS': {
      return {
        ...state,
        loading: false,
        name: action.name
      };
    }
    default: {
      return state;
    }
  }
}

const store = new Store({ name: 'Johnny' }, reducer, thunkMiddleware);

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const fakeFetch = async () => {
  console.log('start fetching, it take 500 milliseconds');
  await wait(500);

  return {
    response: {
      status: 200
    }
  }
}

// React view component
const DynamicName = (props) => {
  const { name, subtitle, onChangeName, onCancelChangeName } = props;
  return (
    <div>
      <h1>{ name }</h1>
      <h2>{ subtitle }</h2>
      <button onClick={() => onChangeName('Harry')} >Harry</button>
      <button onClick={() => onChangeName('Sally')} >Sally</button>
      <button onClick={() => onCancelChangeName()}>Cancel</button>
    </div>
  );
}

const updateName = name => ({ dispatch, cancel }) => {
  dispatch({type: 'UPDATE_NAME_START'});
  Rx.Observable.fromPromise(fakeFetch())
    .takeUntil(cancel('UPDATE_NAME_CANCEL'))
    .subscribe(response => {
      if (response.status >= 400) {
        dispatch({type: 'UPDATE_NAME_FAILURE', error: 'Impossible to add the name'})
      }
      dispatch({type: 'UPDATE_NAME_SUCCESS', name})
    }, error => {
        console.warn(error);
        dispatch({type: 'UPDATE_NAME_FAILURE', error: 'Impossible to add the name'});
    })
}

// subscribe and render the view
const dom =  document.getElementById('root');
const ConnectedApp = connect((state) => {
  return {
    name: state.name
  }
}, (dispatch) => {
  return {
    onChangeName: name => dispatch(updateName(name)),
    onCancelChangeName: () => dispatch({ type: 'UPDATE_NAME_CANCEL' })
  }
})(DynamicName);

ReactDOM.render(<Provider store={ store }><ConnectedApp subtitle="Un good test"></ConnectedApp></Provider>, dom);
