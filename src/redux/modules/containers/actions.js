const _ACTIONS = {
  LOAD_LOGS: 'LOAD_LOGS',
  LOAD_LOGS_SUCCESS: 'LOAD_LOGS_SUCCESS',
  LOAD_LOGS_FAIL: 'LOAD_LOGS_FAIL'
};

Object.keys(_ACTIONS).forEach((key) => {
  _ACTIONS[key] = 'containers/' + _ACTIONS[key];
});
export const ACTIONS = _ACTIONS;
