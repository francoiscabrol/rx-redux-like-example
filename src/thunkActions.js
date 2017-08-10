import Rx from "rxjs/Rx";
import api from "./api";
import * as actions from './actions';

function createThunkAction(type, thunk) {
    return {
        type,
        thunk
    }
}

const updateNameThunkAction = createThunkAction(actions.UPDATE_NAME, ({ name }) => ({ dispatch, watch }) => {
  dispatch({ type: actions.UPDATE_NAME_START });
  Rx.Observable
    .fromPromise(api.fakeFetch())
    .takeUntil(watch(actions.UPDATE_NAME_CANCEL))
    .subscribe(
      response => {
        if (response.status >= 400) {
          dispatch({
            type: actions.UPDATE_NAME_FAILURE,
            error: "Impossible to add the name"
          });
        }
        dispatch({ type: actions.UPDATE_NAME_SUCCESS, name });
      },
      error => {
        console.warn(error);
        dispatch({
          type: actions.UPDATE_NAME_FAILURE,
          error: "Impossible to add the name"
        });
      }
    );
});

export default [updateNameThunkAction];