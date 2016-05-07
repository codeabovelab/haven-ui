import {ACTIONS} from './actions';
const initialState = {
  new: {
    creating: false
  }
};
export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case ACTIONS.CREATE:
      return {
        ...state,
        new: {
          creating: true
        }
      };
    case ACTIONS.CREATE_SUCCESS:
      return {
        ...state,
        new: {
          creating: false
        }
      };
    case ACTIONS.CREATE_FAIL:
      return {
        ...state,
        new: {
          creating: false
        }
      };
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
