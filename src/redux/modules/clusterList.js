const LOAD = 'cluster/LOAD';
const LOAD_SUCCESS = 'cluster/LOAD_SUCCESS';
const LOAD_FAIL = 'cluster/LOAD_FAIL';
const CREATE = 'cluster/CREATE';
const CREATE_SUCCESS = 'cluster/CREATE_SUCCESS';
const CREATE_FAIL = 'cluster/CREATE_FAIL';

const initialState = {
  loaded: false,
  saveError: {}
};

export function isLoaded(globalState) {
  return globalState.clusterList && globalState.clusterList.loaded;
}

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        loading: true
      };
    case LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        data: action.result,
        error: null
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        data: null,
        error: action.error
      };
    case CREATE_SUCCESS:
      return {
        ...state,
        created: true
      };
    default:
      return state;
  }
}

function _loadClusters(client) {
  return client.get('/ui/api/clusters/');
}
export function load() {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: _loadClusters
  };
}

export function create({name, env}) {
  let id = `${env}:${name}`;
  return {
    types: [CREATE, CREATE_SUCCESS, CREATE_FAIL],
    promise: (client) => client.put(`/ui/api/clusters/${id}`)
  };
}
