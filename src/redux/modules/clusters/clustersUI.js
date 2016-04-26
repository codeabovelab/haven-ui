import {ACTIONS} from './clusters';

export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    case ACTIONS.CREATE:
      return {
        ...state,
        createError: null
      };
    case ACTIONS.CREATE_FAIL:
      return {
        ...state,
        createError: action.error.message
      };
    default:
      return state;
  }
}
