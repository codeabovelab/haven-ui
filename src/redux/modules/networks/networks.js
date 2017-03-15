import {ACTIONS} from './actions';
import _ from 'lodash';

export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    case ACTIONS.LIST_NETWORKS:
      return {
        ...state,
        loadingList: true
      };
    case ACTIONS.LIST_NETWORKS_SUCCESS:
      return {
        ...state,
        list: action.result,
        loadingList: false
      };
    case ACTIONS.LIST_NETWORKS_FAIL:
      return {
        ...state,
        loadingList: false
      };
    default:
      return state;
  }
}

export function listNetworks(clusterId) {
  return {
    types: [ACTIONS.LIST_NETWORKS, ACTIONS.LIST_NETWORKS_SUCCESS, ACTIONS.LIST_NETWORKS_FAIL],
    promise: (client) => client.get(`/ui/api/clusters/${clusterId}/networks`)
  };
}
//container = null to optimize loadingDialog code, don't delete
export function deleteNetwork(clusterId, networkId, container = null) {
  return {
    types: [ACTIONS.DELETE_NETWORK, ACTIONS.DELETE_NETWORK_SUCCESS, ACTIONS.DELETE_NETWORK_FAIL],
    promise: (client) => client.del('/ui/api/networks/delete', {params: {cluster: clusterId, network: networkId}})
  };
}

export function connectNetwork(clusterId, networkId, container) {
  return {
    types: [ACTIONS.CONNECT_NETWORK, ACTIONS.CONNECT_NETWORK_SUCCESS, ACTIONS.CONNECT_NETWORK_FAIL],
    promise: (client) => client.post('/ui/api/networks/connect', {params: {cluster: clusterId, network: networkId, container: container.id}})
  };
}

export function disconnectNetwork(clusterId, networkId, container) {
  return {
    types: [ACTIONS.DISCONNECT_NETWORK, ACTIONS.DISCONNECT_NETWORK_SUCCESS, ACTIONS.DISCONNECT_NETWORK_FAIL],
    promise: (client) => client.post('/ui/api/networks/disconnect', {params: {cluster: clusterId, network: networkId, container: container.id}})
  };
}

