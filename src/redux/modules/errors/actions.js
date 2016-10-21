const _ACTIONS = {
  REMOVE_ERROR_MESSAGE: 'REMOVE_ERROR_MESSAGE'
};

Object.keys(_ACTIONS).forEach((key) => {
  _ACTIONS[key] = 'errors/' + _ACTIONS[key];
});
export const ACTIONS = _ACTIONS;
