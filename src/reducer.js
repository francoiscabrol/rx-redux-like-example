import Rx from "rxjs/Rx";
import api from "./api";

const UPDATE_NAME_START = "UPDATE_NAME_START";
const UPDATE_NAME_CANCEL = "UPDATE_NAME_CANCEL ";
const UPDATE_NAME_FAILURE = "UPDATE_NAME_FAILURE";
const UPDATE_NAME_SUCCESS = "UPDATE_NAME_SUCCESS";

export const cancelUpdateName = () => ({ type: UPDATE_NAME_CANCEL });

export const updateName = name => ({ dispatch, watch }) => {
  dispatch({ type: UPDATE_NAME_START });
  Rx.Observable
    .fromPromise(api.fakeFetch())
    .takeUntil(watch(UPDATE_NAME_CANCEL))
    .subscribe(
      response => {
        if (response.status >= 400) {
          dispatch({
            type: UPDATE_NAME_FAILURE,
            error: "Impossible to add the name"
          });
        }
        dispatch({ type: UPDATE_NAME_SUCCESS, name });
      },
      error => {
        console.warn(error);
        dispatch({
          type: UPDATE_NAME_FAILURE,
          error: "Impossible to add the name"
        });
      }
    );
};

// Redux reducer
const reducer = (state, action) => {
  switch (action.type) {
    case UPDATE_NAME_START: {
      return {
        ...state,
        loading: true
      };
    }
    case UPDATE_NAME_FAILURE: {
      return {
        ...state,
        loading: false,
        error: action.error
      };
    }
    case UPDATE_NAME_SUCCESS: {
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
