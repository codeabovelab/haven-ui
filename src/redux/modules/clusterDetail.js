const LOAD_CONTAINERS = 'clusterDetail/LOAD_CONTAINERS';
const LOAD_NODES = 'clusterDetail/LOAD_NODES';
const LOAD_CONTAINERS_SUCCESS = 'clusterDetail/LOAD_CONTAINERS_SUCCESS';
const LOAD_CONTAINERS_FAIL = 'clusterDetail/LOAD_CONTAINERS_FAIL';

const initialState = {
  loaded: false,
  editing: {},
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

//export function loadNodes(cluster) {
//  return {
//    types: [LOAD_CONTAINERS, LOAD_CONTAINERS_SUCCESS, LOAD_CONTAINERS_FAIL],
//    promise: (client) => client.get(`/ui/api/clusters/${cluster}/containers`)
//  };
//}
