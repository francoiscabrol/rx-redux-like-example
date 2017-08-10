import * as actions from './actions';

export const cancelUpdateName = () => ({ type: actions.UPDATE_NAME_CANCEL });

export const updateName = name => ({ type: actions.UPDATE_NAME, name })
