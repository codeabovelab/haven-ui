import {ACTIONS} from './actions';
import _ from 'lodash';

export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    case ACTIONS.GET_ROLES_SUCCESS:
      return {
        ...state,
        roles: action.result
      };
    case ACTIONS.GET_CURRENT_USER_SUCCESS:
      let user = _.keyBy(action.result, 'user');
      return {
        ...state,
        currentUser: user
      };
    case ACTIONS.GET_USERS_SUCCESS:
      return {
        ...state,
        usersList: _.keyBy(action.result, 'user')
      };
    case ACTIONS.GET_USER_SUCCESS:
      return {
        ...state,
        usersList: {...state.usersList, ..._.keyBy(action.result, 'user')}
      };
    case ACTIONS.SET_USER:
      return {
        ...state,
        setUserError: null
      };
    case ACTIONS.SET_USER_FAIL:
      return {
        ...state,
        setUserError: action.error.message
      };
    case ACTIONS.GET_USER_ROLES_SUCCESS:
      return {
        ...state,
        usersList: {
          ...state.usersList,
          [action.id]: {
            ...state.usersList[action.id],
            roles: action.result
          }
        }
      };
    case ACTIONS.DELETE_USER_ROLE:
      return {
        ...state,
        deleteUserRoleError: null
      };
    case ACTIONS.DELETE_USER_ROLE_FAIL:
      return {
        ...state,
        deleteUserRoleError: action.error.message
      };
    case ACTIONS.ADD_USER_ROLE:
      return {
        ...state,
        addUserRoleError: null
      };
    case ACTIONS.ADD_USER_ROLE_FAIL:
      return {
        ...state,
        addUserRoleError: action.error.message
      };
    case ACTIONS.DELETE_USER:
      return {
        ...state,
        deleteUserError: null
      };
    case ACTIONS.DELETE_USER_FAIL:
      return {
        ...state,
        deleteUserError: action.error.message
      };
    default:
      return state;
  }
}

export function getRoles() {
  return {
    types: [ACTIONS.GET_ROLES, ACTIONS.GET_ROLES_SUCCESS, ACTIONS.GET_ROLES_FAIL],
    promise: (client) => client.get(`/ui/api/roles/`)
  };
}

export function getCurrentUser() {
  return {
    types: [ACTIONS.GET_CURRENT_USER, ACTIONS.GET_CURRENT_USER_SUCCESS, ACTIONS.GET_CURRENT_USER_FAIL],
    promise: (client) => client.get(`/ui/api/users-current`)
  };
}

export function getUsers() {
  return {
    types: [ACTIONS.GET_USERS, ACTIONS.GET_USERS_SUCCESS, ACTIONS.GET_USERS_FAIL],
    promise: (client) => client.get(`/ui/api/users/`)
  };
}

export function deleteUser(userName) {
  return {
    types: [ACTIONS.DELETE_USER, ACTIONS.DELETE_USER_SUCCESS, ACTIONS.DELETE_USER_FAIL],
    promise: (client) => client.del(`/ui/api/users/${userName}`)
  };
}

export function getUser(userName) {
  return {
    types: [ACTIONS.GET_USER, ACTIONS.GET_USER_SUCCESS, ACTIONS.GET_USER_FAIL],
    promise: (client) => client.get(`/ui/api/users/${userName}`)
  };
}

export function setUser(userName, userData) {
  return {
    types: [ACTIONS.SET_USER, ACTIONS.SET_USER_SUCCESS, ACTIONS.SET_USER_FAIL],
    promise: (client) => client.post(`/ui/api/users/${userName}`, {data: userData})
  };
}

export function getUserRoles(userName) {
  return {
    types: [ACTIONS.GET_USER_ROLES, ACTIONS.GET_USER_ROLES_SUCCESS, ACTIONS.GET_USER_ROLES_FAIL],
    id: userName,
    promise: (client) => client.post(`/ui/api/users/${userName}/roles`)
  };
}

export function deleteUserRole(userName, role) {
  return {
    types: [ACTIONS.DELETE_USER_ROLE, ACTIONS.DELETE_USER_ROLE_SUCCESS, ACTIONS.DELETE_USER_ROLE_FAIL],
    promise: (client) => client.del(`/ui/api/users/${userName}/roles/${role}`)
  };
}

export function addUserRole(userName, role) {
  return {
    types: [ACTIONS.ADD_USER_ROLE, ACTIONS.ADD_USER_ROLE_SUCCESS, ACTIONS.ADD_USER_ROLE_FAIL],
    promise: (client) => client.post(`/ui/api/users/${userName}/roles/${role}`)
  };
}

export function setSingleACL(type, id, aclData) {
  return {
    types: [ACTIONS.SET_Single_ACL, ACTIONS.SET_Single_ACL_SUCCESS, ACTIONS.SET_Single_ACL_FAIL],
    promise: (client) => client.post(`/ui/api/acl/${type}/${id}`, {data: aclData})
  };
}

export function setACL(aclData) {
  return {
    types: [ACTIONS.SET_ACL, ACTIONS.SET_ACL_SUCCESS, ACTIONS.SET_ACL_FAIL],
    promise: (client) => client.post(`/ui/api/acl/`, {data: aclData})
  };
}
