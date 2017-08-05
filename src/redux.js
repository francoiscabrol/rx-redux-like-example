import React from 'react';
import Rx from 'rxjs/Rx';
import PropTypes from 'prop-types';
import R from 'ramda';

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

export function connect(mapStateToProps = () => ({}), mapDispatchToProps = () => ({})) {
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

export class Store {

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

export const thunkMiddleware = ({dispatch, getState, cancel}) => next => action => {
  if (typeof action === 'function') {
    return action({dispatch, getState, cancel});
  }
  return next(action);
};
