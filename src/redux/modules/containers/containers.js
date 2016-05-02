import {ACTIONS as CLUSTER_ACTIONS} from '../clusters/actions';
import {ACTIONS} from './actions';
import _ from 'lodash';

export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    case CLUSTER_ACTIONS.LOAD_CONTAINERS_SUCCESS:
      return {
        ...state,
        ..._.keyBy(action.result, 'id')
      };
    case ACTIONS.LOAD_LOGS_SUCCESS:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          logs: action.result._res.text
        }
      };
    default:
      return state;
  }
}
export function loadLogs({cluster, containerId}) {
  return {
    types: [ACTIONS.LOAD_LOGS, ACTIONS.LOAD_LOGS_SUCCESS, ACTIONS.LOAD_LOGS_FAIL],
    id: containerId,
    promise: (client) => client.get(`/ui/api/clusters/${cluster}/containers/${containerId}/logs`)
  };
}
