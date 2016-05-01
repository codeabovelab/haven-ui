const _ACTIONS = {
  LOGIN: 'LOGIN',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAIL: 'LOGIN_FAIL',
  LOGOUT: 'LOGOUT',
  LOGOUT_SUCCESS: 'LOGOUT_SUCCESS',
  LOGOUT_FAIL: 'LOGOUT_FAIL'
};

Object.keys(_ACTIONS).forEach((key) => {
  _ACTIONS[key] = 'auth/' + _ACTIONS[key];
});
export const ACTIONS = _ACTIONS;
