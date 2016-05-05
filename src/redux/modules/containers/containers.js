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

function _containerUrl(container) {
  return `/ui/api/clusters/${container.cluster}/containers/${container.id}`;
}
export function loadLogs(container) {
  let url = _containerUrl(container);
  return {
    types: [ACTIONS.LOAD_LOGS, ACTIONS.LOAD_LOGS_SUCCESS, ACTIONS.LOAD_LOGS_FAIL],
    id: container.id,
    promise: (client) => client.get(`${url}/logs`)
  };
}

export function start(container) {
  let url = _containerUrl(container);
  return {
    types: [ACTIONS.START, ACTIONS.START_SUCCESS, ACTIONS.START_FAIL],
    id: container.id,
    promise: (client) => client.post(`${url}/start`)
  };
}

export function stop(container) {
  let url = _containerUrl(container);
  return {
    types: [ACTIONS.STOP, ACTIONS.STOP_SUCCESS, ACTIONS.STOP_FAIL],
    id: container.id,
    promise: (client) => client.post(`${url}/stop`)
  };
}

export function restart(container) {
  let url = _containerUrl(container);
  return {
    types: [ACTIONS.RESTART, ACTIONS.RESTART_SUCCESS, ACTIONS.RESTART_FAIL],
    id: container.id,
    promise: (client) => client.post(`${url}/restart`)
  };
}

export function remove(container) {
  let url = _containerUrl(container);
  return {
    types: [ACTIONS.REMOVE, ACTIONS.REMOVE_SUCCESS, ACTIONS.REMOVE_FAIL],
    id: container.id,
    promise: (client) => client.post(`${url}/remove`)
  };
}
