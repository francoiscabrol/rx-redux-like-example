import React from "react";
import { connect } from "./redux";
import { updateName, cancelUpdateName } from "./reducers/user";
import { showAlert } from "./reducers/message";

// React view component
const DynamicName = props => {
  const { name, message, subtitle, onChangeName, onCancelChangeName, show } = props;
  return (
    <div>
      <h1>
        {name}
      </h1>
      <h2>
        {subtitle}
      </h2>
      <h3>
        {message}
      </h3>
      <button onClick={() => show("You clicked!")}>Click test</button>
      <button onClick={() => onChangeName("Harry")}>Harry</button>
      <button onClick={() => onChangeName("Sally")}>Sally</button>
      <button onClick={() => onCancelChangeName()}>Cancel</button>
    </div>
  );
};

const ConnectedApp = connect(
  state => {
    return {
      name: state.user.name,
      message: state.message.value
    };
  },
  dispatch => {
    return {
      show: message => dispatch(showAlert(message)),
      onChangeName: name => dispatch(updateName(name)),
      onCancelChangeName: () => dispatch(cancelUpdateName())
    };
  }
)(DynamicName);

export default ConnectedApp;
