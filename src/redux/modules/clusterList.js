const LOAD = 'cluster/LOAD';
const LOAD_SUCCESS = 'cluster/LOAD_SUCCESS';
const LOAD_FAIL = 'cluster/LOAD_FAIL';
const CREATE = 'cluster/CREATE';
const CREATE_SUCCESS = 'cluster/CREATE_SUCCESS';
const CREATE_FAIL = 'cluster/CREATE_FAIL';

export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    case LOAD_SUCCESS:
      return {
        ...state,
        data: action.result
      };
    case CREATE:
      return {
        ...state,
        createError: null
      };
    case CREATE_FAIL:
      return {
        ...state,
        createError: action.error.message
      };
    default:
      return state;
  }
}

export function load() {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) => client.get('/ui/api/clusters/')
  };
}

export function create({env, name}) {
  let id = `${env}:${name}`;
  return {
    types: [CREATE, CREATE_SUCCESS, CREATE_FAIL],
    promise: (client) => client.put(`/ui/api/clusters/${id}`)
  };
}
