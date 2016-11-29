import {ACTIONS} from './actions';
const initState = {
  list: null
};

export default function reducer(state = initState, action = {}) {
  switch (action.type) {
    case ACTIONS.LOAD_SUCCESS:
      return {
        ...state,
        list: action.result.map(cluster => cluster.name)
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
    case ACTIONS.UPDATE:
      return {
        ...state,
        createError: null
      };
    case ACTIONS.UPDATE_FAIL:
      return {
        ...state,
        createError: action.error.message
      };
    default:
      return state;
  }
}
