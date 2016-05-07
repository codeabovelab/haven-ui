import {ACTIONS} from './actions';

export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    case ACTIONS.LOAD_LOGS:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          loadingLogs: true
        }
      };
    case ACTIONS.LOAD_LOGS_SUCCESS:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          loadingLogs: false
        }
      };
    case ACTIONS.LOAD_LOGS_FAIL:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          loadingLogs: false
        }
      };
    default:
      return state;
  }
}
