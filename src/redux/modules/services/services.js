import {ACTIONS} from './actions';
import _ from 'lodash';

export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    case ACTIONS.LOAD_SERVICES:
      return {
        ...state,
        loading: true
      };
    case ACTIONS.LOAD_SERVICES_SUCCESS:
      return {
        ...state,
        loading: false,
        [action.cluster]: _.keyBy(action.result, 'id')
      };
    case ACTIONS.LOAD_SERVICES_FAIL:
      return {
        loading: false,
      };
    case ACTIONS.SCALE_SERVICE:
      return {
        ...state,
        [action.cluster]: {
          ...state[action.cluster],
          [action.id]: {
            ...state[action.cluster][action.id],
            scaling: true
          }
        }
      };
    case ACTIONS.SCALE_SERVICE_SUCCESS:
      return {
        ...state,
        [action.cluster]: {
          ...state[action.cluster],
          [action.id]: {
            ...state[action.cluster][action.id],
            scaling: false
          }
        }
      };
    case ACTIONS.SCALE_SERVICE_FAIL:
      return {
        ...state,
        [action.cluster]: {
          ...state[action.cluster],
          [action.id]: {
            ...state[action.cluster][action.id],
            scaling: false
          }
        }
      };
    default:
      return state;
  }
}


export function getClusterServices(clusterId) {
  return {
    types: [ACTIONS.LOAD_SERVICES, ACTIONS.LOAD_SERVICES_SUCCESS, ACTIONS.LOAD_SERVICES_FAIL],
    cluster: clusterId,
    promise: (client) => client.get(`/ui/api/clusters/${clusterId}/services`)
  };
}

export function create(service) {
  console.log('service ', service);
  return {
    types: [ACTIONS.CREATE_SERVICE, ACTIONS.CREATE_SERVICE_SUCCESS, ACTIONS.CREATE_SERVICE_FAIL],
    promise: (client) => client.post(`/ui/api/services/create`, {data: service})
  };
}

export function deleteService(cluster, service) {
  return {
    types: [ACTIONS.DELETE_SERVICE, ACTIONS.DELETE_SERVICE_SUCCESS, ACTIONS.DELETE_SERVICE_FAIL],
    promise: (client) => client.post(`/ui/api/services/delete`, {params: {id: service.id, cluster: cluster}})
  };
}

export function scaleService(service, cluster, scale) {
  return {
    id: service.id,
    cluster: cluster,
    types: [ACTIONS.SCALE_SERVICE, ACTIONS.SCALE_SERVICE_SUCCESS, ACTIONS.SCALE_SERVICE_FAIL],
    promise: (client) => client.post(`/ui/api/services/scale`, {params: {id: service.id, cluster: cluster, scale: scale}})
  };
}
