import {ACTIONS} from './actions';
import _ from 'lodash';


export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    case ACTIONS.LOAD_SUCCESS:
      return _.merge({}, state, _.keyBy(action.result, 'name'));
    case ACTIONS.LOAD_CONTAINERS_SUCCESS:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          containersList: action.result.map(container => container.name)
        }
      };
    default:
      return state;
  }
}

export function load() {
  return {
    types: [ACTIONS.LOAD, ACTIONS.LOAD_SUCCESS, ACTIONS.LOAD_FAIL],
    promise: (client) => client.get('/ui/api/clusters/')
  };
}

export function create({env, name}) {
  let id = `${env}:${name}`;
  return {
    types: [ACTIONS.CREATE, ACTIONS.CREATE_SUCCESS, ACTIONS.CREATE_FAIL],
    promise: (client) => client.put(`/ui/api/clusters/${id}`)
  };
}

export function deleteCluster(clusterId) {
  return {
    types: [ACTIONS.DELETE, ACTIONS.DELETE_SUCCESS, ACTIONS.DELETE_FAIL],
    id: clusterId,
    promise: (client) => client.del(`/ui/api/clusters/${clusterId}`)
  };
}

export function loadContainers(clusterId) {
  return {
    types: [ACTIONS.LOAD_CONTAINERS, ACTIONS.LOAD_CONTAINERS_SUCCESS, ACTIONS.LOAD_CONTAINERS_FAIL],
    id: clusterId,
    promise: (client) => client.get(`/ui/api/clusters/${clusterId}/containers`)
  };
}

