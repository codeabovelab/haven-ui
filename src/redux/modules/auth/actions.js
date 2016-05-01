const _ACTIONS = {
  LOAD_FROM_LS_SUCCESS: 'LOAD_FROM_LS',
  LOGIN: 'LOGIN',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAIL: 'LOGIN_FAIL',
  LOGOUT_SUCCESS: 'LOGOUT_SUCCESS'
};

Object.keys(_ACTIONS).forEach((key) => {
  _ACTIONS[key] = 'auth/' + _ACTIONS[key];
});
export const ACTIONS = _ACTIONS;
