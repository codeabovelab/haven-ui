import {ACTIONS as CLUSTER_ACTIONS} from '../clusters/actions';
import {ACTIONS} from './actions';
import _ from 'lodash';

export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    case CLUSTER_ACTIONS.LOAD_CONTAINERS_SUCCESS:
      return {
        ...state,
        ..._.keyBy(action.result, 'id')
      };
    case ACTIONS.LOAD_DETAILS_SUCCESS:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          details: _.omit(action.result, '_res')
        }
      };
    case ACTIONS.LOAD_LOGS_SUCCESS:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          logs: action.result._res.text
        }
      };
    case ACTIONS.LOAD_STATISTICS_SUCCESS:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          statistics: _.omit(action.result, '_res')
        }
      };
    case ACTIONS.LOAD_DETAILS_BY_NAME_SUCCESS:
      console.log(action.result);
      return {
        ...state,
        detailsByName: {
          ...state.detailsByName,
          [action.result.name]: _.omit(action.result, '_res')
        }
      };
    default:
      return state;
  }
}

function _containerUrl(container) {
  return `/ui/api/containers/${container.id}`;
}
export function loadLogs(container) {
  let url = _containerUrl(container);
  return {
    types: [ACTIONS.LOAD_LOGS, ACTIONS.LOAD_LOGS_SUCCESS, ACTIONS.LOAD_LOGS_FAIL],
    id: container.id,
    promise: (client) => client.get(`${url}/logs`)
  };
}

export function create(container) {
  return {
    types: [ACTIONS.CREATE, ACTIONS.CREATE_SUCCESS, ACTIONS.CREATE_FAIL],
    promise: (client) => client.post(`/ui/api/containers/create`, {data: container})
  };
}

export function start(container) {
  let url = _containerUrl(container);
  return {
    types: [ACTIONS.START, ACTIONS.START_SUCCESS, ACTIONS.START_FAIL],
    id: container.id,
    promise: (client) => client.post(`${url}/start`)
  };
}

export function stop(container) {
  let url = _containerUrl(container);
  return {
    types: [ACTIONS.STOP, ACTIONS.STOP_SUCCESS, ACTIONS.STOP_FAIL],
    id: container.id,
    promise: (client) => client.post(`${url}/stop`)
  };
}

export function restart(container) {
  let url = _containerUrl(container);
  return {
    types: [ACTIONS.RESTART, ACTIONS.RESTART_SUCCESS, ACTIONS.RESTART_FAIL],
    id: container.id,
    promise: (client) => client.post(`${url}/restart`)
  };
}

export function scale(container, scaleFactor) {
  let url = _containerUrl(container);
  return {
    types: [ACTIONS.SCALE, ACTIONS.SCALE_SUCCESS, ACTIONS.SCALE_FAIL],
    id: container.id,
    promise: (client) => client.post(`${url}/scale`, {data: {scaleFactor: scaleFactor, id: container.id}})
  };
}

export function loadDetails(container) {
  let url = _containerUrl(container);
  return {
    types: [ACTIONS.LOAD_DETAILS, ACTIONS.LOAD_DETAILS_SUCCESS, ACTIONS.LOAD_DETAILS_FAIL],
    id: container.id,
    promise: (client) => client.get(`${url}/details`)
  };
}

export function loadDetailsByName(clusterName, containerName) {
  return {
    types: [ACTIONS.LOAD_DETAILS_BY_NAME, ACTIONS.LOAD_DETAILS_BY_NAME_SUCCESS, ACTIONS.LOAD_DETAILS_BY_NAME_FAIL],
    promise: (client) => client.get(`/ui/api/containers/${clusterName}/${containerName}`)
  };
}

export function loadStatistics(container) {
  let url = _containerUrl(container);
  return {
    types: [ACTIONS.LOAD_STATISTICS, ACTIONS.LOAD_STATISTICS_SUCCESS, ACTIONS.LOAD_STATISTICS_FAIL],
    id: container.id,
    promise: (client) => client.get(`${url}/statistics`)
  };
}

export function remove(container) {
  let url = _containerUrl(container);
  return {
    types: [ACTIONS.REMOVE, ACTIONS.REMOVE_SUCCESS, ACTIONS.REMOVE_FAIL],
    id: container.id,
    promise: (client) => client.post(`${url}/remove`)
  };
}

export function updateContainer(container, data) {
  let url = _containerUrl(container);
  return {
    types: [ACTIONS.UPDATE_CONTAINER, ACTIONS.UPDATE_CONTAINER_SUCCESS, ACTIONS.UPDATE_CONTAINER_FAIL],
    id: container.id,
    promise: (client) => client.put(`${url}/update`, {data})
  };
}
