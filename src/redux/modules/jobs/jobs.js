import {ACTIONS} from './actions';

export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    case ACTIONS.LOAD_LIST_SUCCESS:
      return {
        ...state,
        jobs: action.result
      };
    case ACTIONS.LOAD_INFO_SUCCESS:
      return {
        ...state,
        jobInfos: {
          ...state.jobInfos,
          [action.id]: action.result
        }
      };
    default:
      return state;
  }
}

export function loadList() {
  return {
    types: [ACTIONS.LOAD_LIST, ACTIONS.LOAD_LIST_SUCCESS, ACTIONS.LOAD_LIST_FAIL],
    id: "jobs",
    promise: (client) => client.get('/ui/api/jobs/')
  };
}

export function loadInfo(jobId) {
  return {
    types: [ACTIONS.LOAD_INFO, ACTIONS.LOAD_INFO_SUCCESS, ACTIONS.LOAD_INFO_FAIL],
    id: jobId,
    promise: (client) => client.get(`/ui/api/jobs/${jobId}/`)
  };
}
