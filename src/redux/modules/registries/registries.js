import {ACTIONS} from './actions';
import _ from 'lodash';

export default function reducer(state = [], action = {}) {
  switch (action.type) {
    case ACTIONS.LOAD_REGISTRIES_SUCCESS:
      return _.keyBy(action.result, 'title');
    case ACTIONS.REFRESH_REGISTRY_SUCCESS:
      return {
        ...state,
        [action.result.title]: action.result
      };
    default:
      return state;
  }
}

export function load() {
  return {
    types: [ACTIONS.LOAD_REGISTRIES, ACTIONS.LOAD_REGISTRIES_SUCCESS, ACTIONS.LOAD_REGISTRIES_FAIL],
    promise: (client) => client.get('/ui/api/registries/')
  };
}

export function addRegistry(register) {
  return {
    types: [ACTIONS.ADD_REGISTRY, ACTIONS.ADD_REGISTRY_SUCCESS, ACTIONS.ADD_REGISTRY_FAIL],
    promise: (client) => client.post(`/ui/api/registries`, {data: register})
  };
}

export function editRegistry(data) {
  return {
    types: [ACTIONS.EDIT_REGISTRY, ACTIONS.EDIT_REGISTRY_SUCCESS, ACTIONS.EDIT_REGISTRY_FAIL],
    promise: (client) => client.put(`/ui/api/registries`, {data})
  };
}

export function removeRegistry(name) {
  return {
    types: [ACTIONS.REMOVE_REGISTRY, ACTIONS.REMOVE_REGISTRY_SUCCESS, ACTIONS.REMOVE_REGISTRY_FAIL],
    promise: (client) => client.del(`/ui/api/registries`, {params: {name}})
  };
}

export function refreshRegistry(name) {
  return {
    id: name,
    types: [ACTIONS.REFRESH_REGISTRY, ACTIONS.REFRESH_REGISTRY_SUCCESS, ACTIONS.REFRESH_REGISTRY_FAIL],
    promise: (client) => client.put('/ui/api/registries/refresh', {params: {name}})
  };
}

