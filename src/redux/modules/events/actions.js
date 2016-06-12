const _ACTIONS = {
  NEW: 'NEW'
};

Object.keys(_ACTIONS).forEach((key) => {
  _ACTIONS[key] = 'events/' + _ACTIONS[key];
});
export const ACTIONS = _ACTIONS;
