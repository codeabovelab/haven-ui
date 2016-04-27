const _ACTIONS = {
  LOAD: 'LOAD',
  LOAD_SUCCESS: 'LOAD_SUCCESS',
  LOAD_FAIL: 'LOAD_FAIL'
};

Object.keys(_ACTIONS).forEach((key) => {
  _ACTIONS[key] = 'nodes/' + _ACTIONS[key];
});
export const ACTIONS = _ACTIONS;
