import {ACTIONS} from './actions';
const initState = {
  list: null
};

export default function reducer(state = initState, action = {}) {
  switch (action.type) {
    case ACTIONS.LOAD_SUCCESS:
      return {
        ...state,
        list: action.result.map(node => node.name)
      };
    case ACTIONS.REMOVE_CREATE_ERROR:
      return {
        ...state,
        createError: null
      };
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

export function removeCreateError() {
  return {
    type: ACTIONS.REMOVE_CREATE_ERROR
  };
}
