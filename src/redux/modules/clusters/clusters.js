const _ACTIONS = {
  LOAD: 'LOAD',
  LOAD_SUCCESS: 'LOAD_SUCCESS',
  LOAD_FAIL: 'LOAD_FAIL',
  CREATE: "CREATE",
  CREATE_SUCCESS: 'CREATE_SUCESS',
  CREATE_FAIL: 'CREATE_FAIL'
};
Object.keys(_ACTIONS).forEach((key) => {
  _ACTIONS[key] = 'clusters/' + _ACTIONS[key];
});

import _ from 'lodash';

export const ACTIONS = _ACTIONS;


export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    case ACTIONS.LOAD_SUCCESS:
      return _.keyBy(action.result, 'name');
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
