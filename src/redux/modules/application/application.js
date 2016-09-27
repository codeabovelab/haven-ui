import {ACTIONS} from './actions';
import _ from 'lodash';

export default function reducer(state = {}, action = {}) {
  console.log(action.type);
  switch (action.type) {
    case ACTIONS.LIST_SUCCESS:
      let namedApplications = _.keyBy(action.result, 'name');
      return {
        ...state,
        applicationsList: {
          ...state.applicationsList,
          [action.clusterName]: {
            ...namedApplications
          }
        }
      };
    case ACTIONS.LOAD_SUCCESS:
      let namedApplication = _.keyBy(action.result, 'name');
      return {
        ...state,
        applicationsList: {
          ...state.applicationsList,
          [action.clusterName]: {
            ...namedApplication
          }
        }
      };
    case ACTIONS.ADD:
      return {
        ...state,
        createError: null
      };
    case ACTIONS.ADD_FAIL:
      return {
        ...state,
        addError: action.error.message
      };
    case ACTIONS.GET_COMPOSE:
      return {
        ...state,
        getComposeError: null
      };
    case ACTIONS.GET_COMPOSE_FAIL:
      return {
        ...state,
        getComposeError: action.error.message
      };
    case ACTIONS.UPLOAD_FILE:
      return {
        ...state,
        getComposeError: null
      };
    case ACTIONS.UPLOAD_FILE_FAIL:
      return {
        ...state,
        getComposeError: action.error.message
      };
    case ACTIONS.UPLOAD_STREAM:
      return {
        ...state,
        getComposeError: null
      };
    case ACTIONS.UPLOAD_STREAM_FAIL:
      return {
        ...state,
        getComposeError: action.error.message
      };
    case ACTIONS.GET_INIT_FILE_SUCCESS:
      return {
        ...state,
        clusters: {
          ...state[action.clusterName],
          applications: {
            ...state[action.applicationName],
            initFile: {...action.result}
          }
        }
      };
    default:
      return state;
  }
}

export function list(clusterId) {
  return {
    types: [ACTIONS.LIST, ACTIONS.LIST_SUCCESS, ACTIONS.LIST_FAIL],
    id: 'applicationList',
    clusterName: clusterId,
    promise: (client) => client.get(`/ui/api/application/${clusterId}/all`)
  };
}

export function deleteApplication(clusterId, appId) {
  return {
    types: [ACTIONS.DELETE, ACTIONS.DELETE_SUCCESS, ACTIONS.DELETE_FAIL],
    clusterName: clusterId,
    applicationName: appId,
    promise: (client) => client.del(`/ui/api/application/${clusterId}/${appId}`)
  };
}

export function load(clusterId, appId) {
  return {
    types: [ACTIONS.LOAD, ACTIONS.LOAD_SUCCESS, ACTIONS.LOAD_FAIL],
    clusterName: clusterId,
    applicationName: appId,
    promise: (client) => client.get(`/ui/api/application/${clusterId}/${appId}`)
  };
}

export function add(clusterId, appId, data) {
  return {
    types: [ACTIONS.ADD, ACTIONS.ADD_SUCCESS, ACTIONS.ADD_FAIL],
    promise: (client) => client.put(`/ui/api/application/${clusterId}/${appId}`, {containers: data})
  };
}

export function getCompose(clusterId, appId) {
  return {
    types: [ACTIONS.GET_COMPOSE, ACTIONS.GET_COMPOSE_SUCCESS, ACTIONS.GET_COMPOSE_FAIL],
    promise: (client) => client.get(`/ui/api/application/${clusterId}/${appId}/compose`)
  };
}

export function uploadStream(clusterId, appId, resource) {
  return {
    types: [ACTIONS.UPLOAD_STREAM, ACTIONS.UPLOAD_STREAM_SUCCESS, ACTIONS.UPLOAD_STREAM_FAIL],
    promise: (client) => client.post(`/ui/api/application/${clusterId}/${appId}/compose`, {data: resource})
  };
}

export function uploadFile(clusterId, appId, pathToFile) {
  return {
    types: [ACTIONS.UPLOAD_FILE, ACTIONS.UPLOAD_FILE_SUCCESS, ACTIONS.UPLOAD_FILE_FAIL],
    promise: (client) => client.post(`/ui/api/application/${clusterId}/${appId}/compose`).attach('composeFile', pathToFile)
  };
}

export function getInitFile(clusterId, appId) {
  return {
    types: [ACTIONS.GET_INIT_FILE, ACTIONS.GET_INIT_FILE_SUCCESS, ACTIONS.GET_INIT_FILE_FAIL],
    clusterName: clusterId,
    applicationName: appId,
    promise: (client) => client.get(`/ui/api/application/${clusterId}/${appId}/initFile`)
  };
}

export function start(clusterId, appId) {
  return {
    types: [ACTIONS.START, ACTIONS.START_SUCCESS, ACTIONS.START_FAIL],
    promise: (client) => client.post(`/ui/api/application/${clusterId}/${appId}/start`)
  };
}

export function stop(clusterId, appId) {
  return {
    types: [ACTIONS.STOP, ACTIONS.STOP_SUCCESS, ACTIONS.STOP_FAIL],
    promise: (client) => client.post(`/ui/api/application/${clusterId}/${appId}/stop`)
  };
}
