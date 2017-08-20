import React from "react";
import Rx from "rxjs/Rx";
import PropTypes from "prop-types";
import R from "ramda";

export class Provider extends React.Component {
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

export function connect(
  mapStateToProps = () => ({}),
  mapDispatchToProps = () => ({})
) {
  return Component => {
    class Connected extends React.Component {
      onStoreOrPropsChange(props, stateProps = {}) {
        const { store } = this.context;
        const dispatchProps = mapDispatchToProps(
          action => store.dispatch(action),
          props
        );
        this.setState({
          ...stateProps,
          ...dispatchProps
        });
      }
      componentWillMount() {
        const { store } = this.context;
        const statePropsObservable = store.store$
          .map(state => mapStateToProps(state, this.props))
          .filter(stateProps => {
            if (this.state === null) return true;
            const currentState = R.pick(Object.keys(stateProps), this.state);
            return !R.equals(currentState, stateProps);
          });

        this.unsubscribe = statePropsObservable.subscribe(stateProps => {
          return this.onStoreOrPropsChange(this.props, stateProps);
        });
      }
      componentWillUnmount() {
        this.unsubscribe();
      }
      render() {
        return <Component {...this.props} {...this.state} />;
      }
    }

    Connected.contextTypes = {
      store: PropTypes.object
    };

    return Connected;
  };
}

export class Store {
  constructor(initState, reducer, middleware) {
    const withDevTools =
      typeof window !== "undefined" && window.devToolsExtension;

    if (withDevTools) this.devTools = window.devToolsExtension.connect();

    // create our stream as a subject so arbitrary data can be sent on the stream
    this.action$ = new Rx.Subject();

    // Reduxification
    const initial = reducer(initState, { type: '@init'})
    this.store$ = this.action$.startWith(initial).scan((state, action) => {
      const newState = reducer(state, action);
      if (withDevTools) this.devTools.send(action.type, newState);
      this.lastState = newState;
      return newState;
    });
    
    this.lastState = undefined ;

    this.middleware = middleware;

    this.coreDispatch = action => {
      this.action$.next(action);
    };

    if (this.middleware) {
      const store = this
      this.dispatchImpl = this.middleware(store)(this.coreDispatch);
    } else {
      this.dispatchImpl = this.coreDispatch;
    }
  }

  watch = actionType => this.action$.filter(({ type }) => type === actionType);

  dispatch = action => {
    this.dispatchImpl(action)
  }

  getState = () => {
    return this.lastState; // should be synchronous
  }

  subscribe(rendererCallback) {
    this.store$.subscribe(rendererCallback);
  }
}

export const thunkMiddleware = ({
  dispatch,
  getState,
  watch
}) => next => action => {
  if (typeof action === "function") {
    return action({ dispatch, getState, watch });
  }
  return next(action);
};

export const createThunkActionMiddleware = thunkActions => {
  return ({
    dispatch
  }) => next => action => {
    if (typeof action === 'object' && typeof action.type === 'string') {
      const thunkAction = R.find(R.propEq("type", action.type))(thunkActions);
      if (thunkAction) {
        thunkAction.thunk(action);
      }
    }
  };
}

export const applyMiddleware = (...middlewares) => store => {
  if (middlewares.length === 0) {
    return dispatch => dispatch;
  }
  if (middlewares.length === 1) {
    return middlewares[0];
  }
  const boundMiddlewares = middlewares.map(middleware => middleware(store));
  return boundMiddlewares.reduce((a, b) => next => a(b(next)));
};

export function combineReducers(reducers) {
  return (state, action) => { 
    const applyReducer = (reducer, reducerKey) => reducer(state[reducerKey], action)
    const newState = R.mapObjIndexed(applyReducer, reducers)
    return newState
  }
}
