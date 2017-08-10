
import * as actions from './actions';

// Redux reducer
const reducer = (state, action) => {
  switch (action.type) {
    case actions.UPDATE_NAME_START: {
      return {
        ...state,
        loading: true
      };
    }
    case actions.UPDATE_NAME_FAILURE: {
      return {
        ...state,
        loading: false,
        error: action.error
      };
    }
    case actions.UPDATE_NAME_SUCCESS: {
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
};

export default reducer;
