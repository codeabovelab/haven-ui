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
    case ACTIONS.LOAD_DETAILS:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          loadingDetails: true
        }
      };
    case ACTIONS.LOAD_DETAILS_SUCCESS:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          loadingDetails: false
        }
      };
    case ACTIONS.LOAD_DETAILS_FAIL:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          loadingDetails: false
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
          error: action.error.message,
          loadingLogs: false
        }
      };
    case ACTIONS.LOAD_STATISTICS:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          loadingStatistics: true
        }
      };
    case ACTIONS.LOAD_STATISTICS_SUCCESS:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          loadingStatistics: false
        }
      };
    case ACTIONS.LOAD_STATISTICS_FAIL:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          loadingStatistics: false
        }
      };
    case ACTIONS.SCALE:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          scaling: true
        }
      };
    case ACTIONS.SCALE_FAIL:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          scaling: false
        }
      };
    case ACTIONS.SCALE_SUCCESS:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          scaling: false
        }
      };
    default:
      return state;
  }
}
