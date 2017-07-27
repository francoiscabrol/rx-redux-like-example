import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Rx from 'rxjs/Rx';
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
        const dispatchProps = mapDispatchToProps(store.dispatch, props);
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
            console.log("updated Connect state:", stateProps);
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

  getState() {
    return this.store$;
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
}

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
      loading: true
    };
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
}

// Example action function
const onChangeName = name => store.dispatch(actions.updateNameStart(name));

// React view component
const DynamicName = (props) => {
  const { name, test } = props;
  return (
    <div>
      <h1>{ name }</h1>
      <h2>{ test }</h2>
      <button onClick={() => onChangeName('Harry')} >Harry</button>
      <button onClick={() => onChangeName('Sally')} >Sally</button>
    </div>
  );
}

// subscribe and render the view
const dom =  document.getElementById('root');
const ConnectedApp = connect((state) => {
  return {
    name: state.name
  }
}, (dispatch) => {
  return {
    onChangeName: name => dispatch(actions.updateNameStart(name))
  }
})(DynamicName);

ReactDOM.render(<Provider store={ store }><ConnectedApp test="ahah"></ConnectedApp></Provider>, dom);
