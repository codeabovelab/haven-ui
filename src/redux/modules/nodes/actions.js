const _ACTIONS = {
  LOAD: 'LOAD',
  LOAD_SUCCESS: 'LOAD_SUCCESS',
  LOAD_FAIL: 'LOAD_FAIL',
  CREATE: "CREATE",
  CREATE_SUCCESS: 'CREATE_SUCCESS',
  CREATE_FAIL: 'CREATE_FAIL',
  REMOVE_CREATE_ERROR: 'REMOVE_CREATE_ERROR',
  REMOVE: "REMOVE",
  REMOVE_SUCCESS: 'REMOVE_SUCCESS',
  REMOVE_FAIL: 'REMOVE_FAIL',
  ADD: "ADD",
  ADD_SUCCESS: 'ADD_SUCCESS',
  ADD_FAIL: 'ADD_FAIL'
};

Object.keys(_ACTIONS).forEach((key) => {
  _ACTIONS[key] = 'nodes/' + _ACTIONS[key];
});
export const ACTIONS = _ACTIONS;
