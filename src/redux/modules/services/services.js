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
        [action.id]: action.result
      };
    case ACTIONS.LOAD_SERVICES_FAIL:
      return {
        loading: false,
      };
    default:
      return state;
  }
}


export function getClusterServices(clusterId) {
  return {
    types: [ACTIONS.LOAD_SERVICES, ACTIONS.LOAD_SERVICES_SUCCESS, ACTIONS.LOAD_SERVICES_FAIL],
    id: clusterId,
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

export function deleteService(serviceId, cluster) {
  return {
    types: [ACTIONS.DELETE_SERVICE, ACTIONS.DELETE_SERVICE_SUCCESS, ACTIONS.DELETE_SERVICE_FAIL],
    promise: (client) => client.post(`/ui/api/services/delete`, {params: {id: serviceId, cluster: cluster}})
  };
}

export function scaleService(serviceId, cluster, scale) {
  return {
    types: [ACTIONS.SCALE_SERVICE, ACTIONS.SCALE_SERVICE_SUCCESS, ACTIONS.SCALE_SERVICE_FAIL],
    promise: (client) => client.post(`/ui/api/services/scale`, {params: {id: serviceId, cluster: cluster, scale: scale}})
  };
}
