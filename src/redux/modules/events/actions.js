const _ACTIONS = {
  NEW: 'NEW',
  COUNT: 'COUNT',
  COUNT_SUCCESS: 'COUNT_SUCCESS',
  COUNT_FAIL: 'COUNT_FAIL',
};

Object.keys(_ACTIONS).forEach((key) => {
  _ACTIONS[key] = 'events/' + _ACTIONS[key];
});
export const ACTIONS = _ACTIONS;
