import {ACTIONS} from './actions';

const initialState = {
  //Authorization: 'Basic YWRtaW46cGFzc3dvcmQ=',
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        token: action.result,
        user: {name: action.result.userName}
      };
    case ACTIONS.LOGIN_FAIL:
      return {
        ...state,
        token: null,
        user: null,
        loginError: action.error
      };
    case ACTIONS.LOGOUT_SUCCESS:
      return {
        ...state,
        loggingOut: false,
        token: null,
        user: null
      };
    default:
      return state;
  }
}


export function login(username, password) {
  return {
    types: [ACTIONS.LOGIN, ACTIONS.LOGIN_SUCCESS, ACTIONS.LOGIN_FAIL],
    promise: (client) => {
      return client.post('/ui/token/login', {
        params: {username, password}
      });
    }
  };
}

export function logout() {
  return {
    types: [ACTIONS.LOGOUT, ACTIONS.LOGOUT_SUCCESS, ACTIONS.LOGOUT_FAIL],
    promise: Promise.resolve()
  };
}
