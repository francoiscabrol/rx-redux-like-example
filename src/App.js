// @flow

import React from "react";
import { connect } from "./redux";
import { updateName, cancelUpdateName } from "./reducer";

// React view component
const DynamicName = props => {
  const { name, subtitle, onChangeName, onCancelChangeName } = props;
  return (
    <div>
      <h1>
        {name}
      </h1>
      <h2>
        {subtitle}
      </h2>
      <button onClick={() => onChangeName("Harry")}>Harry</button>
      <button onClick={() => onChangeName("Sally")}>Sally</button>
      <button onClick={() => onCancelChangeName()}>Cancel</button>
    </div>
  );
};

const ConnectedApp = connect(
  state => {
    return {
      name: state.name
    };
  },
  dispatch => {
    return {
      onChangeName: name => dispatch(updateName(name)),
      onCancelChangeName: () => dispatch(cancelUpdateName())
    };
  }
)(DynamicName);

export default ConnectedApp;
