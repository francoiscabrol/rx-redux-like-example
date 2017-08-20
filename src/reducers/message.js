
// Actions
const SHOW_ALERT = "SHOW_ALERT";

// Actions creator
export const showAlert = (message) => ({ type: SHOW_ALERT, message });

// Redux reducer
const reducer = (state, action) => {
  switch (action.type) {
    case SHOW_ALERT: {
      return {
        ...state,
        value: action.message
      };
    }
    default: {
      return state;
    }
  }
};

export default reducer;