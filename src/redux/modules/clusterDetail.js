const LOAD_CONTAINERS = 'cluster/LOAD_CONTAINERS';
const LOAD_NODES = 'cluster/LOAD_NODES';
const LOAD_CONTAINERS_SUCCESS = 'cluster/LOAD_CONTAINERS_SUCCESS';
const LOAD_CONTAINERS_FAIL = 'cluster/LOAD_CONTAINERS_FAIL';
const DELETE_CLUSTER = 'cluster/DELETE';
const DELETE_CLUSTER_SUCCESS = 'cluster/DELETE_SUCCESS';
const DELETE_CLUSTER_FAIL = 'cluster/DELETE_FAIL';

const initialState = {
  loaded: false,
  saveError: {}
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD_CONTAINERS:
      return {
        ...state,
        loadingContainers: true
      };
    case LOAD_CONTAINERS_SUCCESS:
      return {
        ...state,
        loadingContainers: false,
        loadedContainers: true,
        data: action.result,
        error: null
      };
    case LOAD_CONTAINERS_FAIL:
      return {
        ...state,
        loading: false,
        loadedContainers: false,
        data: null,
        error: action.error
      };

    case DELETE_CLUSTER_SUCCESS:
      return {
        data: null
      };
    default:
      return state;
  }
}

export function loadContainers(cluster) {
  return {
    types: [LOAD_CONTAINERS, LOAD_CONTAINERS_SUCCESS, LOAD_CONTAINERS_FAIL],
    promise: (client) => client.get(`/ui/api/clusters/${cluster}/containers`)
  };
}

export function deleteCluster(clusterName) {
  return {
    types: [DELETE_CLUSTER, DELETE_CLUSTER_SUCCESS, DELETE_CLUSTER_FAIL],
    promise: (client) => client.del(`/ui/api/clusters/${clusterName}`)
  };
}

//export function loadNodes(cluster) {
//  return {
//    types: [LOAD_CONTAINERS, LOAD_CONTAINERS_SUCCESS, LOAD_CONTAINERS_FAIL],
//    promise: (client) => client.get(`/ui/api/clusters/${cluster}/containers`)
//  };
//}
