import {ACTIONS} from './actions';

export default function reducer(state = [], action = {}) {
  const { type, error } = action;
  if (type === ACTIONS.REMOVE_ERROR_MESSAGE) {
    return state.filter((e, i) => i !== action.id);
  } else if (error) {
    return state.concat([action.error]);
  }
  return state;
}

// Clears error message with the given index.
export function removeErrorMessage(index) {
  return {
    type: ACTIONS.REMOVE_ERROR_MESSAGE,
    id: index
  };
}
