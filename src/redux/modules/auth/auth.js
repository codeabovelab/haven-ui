import {ACTIONS} from './actions';

const LS_KEY = 'auth';
import _ from 'lodash';

export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    case ACTIONS.LOAD_FROM_LS_SUCCESS:
      let data = action.data;
      return data ? data : state;
    case ACTIONS.LOGIN:
      return {
        ...state,
        loginError: null
      };
    case ACTIONS.LOGIN_SUCCESS:
      if (!action.result) {
        /* workaround till API fixed
         * that actually means there was redirect
         */
        return {
          ...state,
          token: null,
          user: null,
          loginError: 'Username or password is incorrect.'
        };
      }

      return {
        ...state,
        token: _.omit(action.result, '_res'),
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
        token: null,
        user: null
      };
    default:
      return state;
  }
}

export function loadFromLS() {
  let data = null;
  if (!__SERVER__) {
    //!server side
    let json = ls.getItem(LS_KEY);
    if (json) {
      try {
        data = JSON.parse(json);
        data = data.token && data.user ? data : null;
      } catch (e) {
        data = null;
      }
    }
  }
  return {
    type: ACTIONS.LOAD_FROM_LS_SUCCESS,
    data: data
  };
}

export function saveToLS(auth) {
  window.ls.setItem(LS_KEY, JSON.stringify(auth));
  console.log('saved');
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
  window.ls.removeItem(LS_KEY);
  return {
    type: ACTIONS.LOGOUT_SUCCESS
  };
}
