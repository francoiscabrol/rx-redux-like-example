import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Rx from 'rxjs/Rx';
import { ajax } from 'rxjs/observable/dom/ajax';
import R from 'ramda';

class Provider extends React.Component {
  getChildContext() {
    return {
      store: this.props.store
    };
  }
  render() {
    return this.props.children;
  }
}

Provider.childContextTypes = {
  store: PropTypes.object
};

function connect(mapStateToProps = () => ({}), mapDispatchToProps = () => ({})) {
  return Component => {
    class Connected extends React.Component {
      onStoreOrPropsChange(props, stateProps = {}) {
        const {store} = this.context;
        const dispatchProps = mapDispatchToProps((action) => store.dispatch(action), props);
        this.setState({
          ...stateProps,
          ...dispatchProps
        });
      }
      componentWillMount() {
        const {store} = this.context;
        const statePropsObservable = store.store$.map(state => mapStateToProps(state, this.props)).filter(stateProps => {
          if (this.state === null) return true
          const currentState = R.pick(Object.keys(stateProps), this.state);
          return !R.equals(currentState, stateProps)
        });

        this.unsubscribe = statePropsObservable
          .subscribe((stateProps) => {
            console.log("Re-render the connected component with new props:", stateProps);
            return this.onStoreOrPropsChange(this.props, stateProps);
          });
      }
      componentWillUnmount() {
        this.unsubscribe();
      }
      render() {
        return <Component {...this.props} {...this.state}/>;
      }
    }

    Connected.contextTypes = {
      store: PropTypes.object
    };

    return Connected;
  };
};


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

class Store {

  constructor(initState, reducer, middleware) {
    const withDevTools = typeof window !== 'undefined' && window.devToolsExtension;

    if (withDevTools)
      this.devTools = window.devToolsExtension.connect();

    // create our stream as a subject so arbitrary data can be sent on the stream
    this.action$ = new Rx.Subject();

    // Reduxification
    this.store$ = this.action$
      .startWith(initState)
      .scan((state, action) => {
        const newState = reducer(state, action);
        console.log('a', action)
        if (withDevTools)
          this.devTools.send(action.type, newState);
        return newState;
      });

    this.middleware = middleware;

    this.coreDispatch = (action) => {
      this.action$.next(action);
    }

    if (this.middleware) {
      const dispatch = action => this.dispatch(action);
      const cancel = (cancelType) => this.action$.filter(({ type }) => type === cancelType);
      this.dispatch = this.middleware({dispatch, getState: this.getState, cancel})(this.coreDispatch);
    } else {
      this.dispatch = this.coreDispatch;
    }
  }

  getState() {
    return this.store$; // should be synchronous
  }

  subscribe(rendererCallback) {
    this.store$.subscribe(rendererCallback);
  }
}

const thunkMiddleware = ({dispatch, getState, cancel}) => next => action => {
  if (typeof action === 'function') {
    return action({dispatch, getState, cancel});
  }
  return next(action);
};

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
