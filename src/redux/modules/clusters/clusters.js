import {ACTIONS} from './actions';
import _ from 'lodash';
import {Cluster} from '../../models/common/Cluster';
import config from '../../../config';
import {loadContainers as mockLoadContainers} from './clusters.mock.js';

export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    case ACTIONS.LOAD_SUCCESS:
      let clusters = action.result.map(row => {
        let data = Object.assign({}, state[row.name], row);
        return new Cluster({init: data});
      });
      return _.merge({}, state, _.keyBy(clusters, 'name'));

    case ACTIONS.CONFIG_SUCCESS:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          configuration: action.result
        }
      };

    case ACTIONS.INFORMATION_SUCCESS:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          information: action.result
        }
      };

    case ACTIONS.LOAD_CONTAINERS_SUCCESS:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          containersList: action.result.map(container => container.id)
        }
      };

    case ACTIONS.LOAD_DEFAULT_PARAMS_SUCCESS:
      let defaultParams = Object.assign({[action.image]: {}}, state[action.id].defaultParams);
      defaultParams[action.image][action.tag] = _.omit(action.result, '_res');
      return {
        ...state,
        [action.id]: {...state[action.id], defaultParams}
      };

    case ACTIONS.LOAD_NODES_SUCCESS:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          nodesList: action.result
        }
      };

    default:
      return state;
  }
}

export function isLoaded(globalState) {
  return globalState.clusters && (Object.keys(globalState.clusters).length > 0);
}

export function load() {
  return {
    types: [ACTIONS.LOAD, ACTIONS.LOAD_SUCCESS, ACTIONS.LOAD_FAIL],
    promise: (client) => client.get('/ui/api/clusters/')
  };
}

export function create(name) {
  return {
    types: [ACTIONS.CREATE, ACTIONS.CREATE_SUCCESS, ACTIONS.CREATE_FAIL],
    promise: (client) => client.put(`/ui/api/clusters/${name}`, {data: {}})
  };
}

export function deleteCluster(clusterId) {
  return {
    types: [ACTIONS.DELETE, ACTIONS.DELETE_SUCCESS, ACTIONS.DELETE_FAIL],
    id: clusterId,
    promise: (client) => client.del(`/ui/api/clusters/${clusterId}`)
  };
}

export function clusterConfig(clusterId) {
  return {
    types: [ACTIONS.CONFIG, ACTIONS.CONFIG_SUCCESS, ACTIONS.CONFIG_FAIL],
    id: clusterId,
    promise: (client) => client.get(`/ui/api/clusters/${clusterId}/config`)
  };
}

export function clusterInformation(clusterId) {
  return {
    types: [ACTIONS.INFORMATION, ACTIONS.INFORMATION_SUCCESS, ACTIONS.INFORMATION_FAIL],
    id: clusterId,
    promise: (client) => client.get(`/ui/api/clusters/${clusterId}/info`)
  };
}

export function loadContainers(clusterId) {
  // if (config.mock || true) {
  //   return mockLoadContainers(clusterId);
  // }
  return {
    types: [ACTIONS.LOAD_CONTAINERS, ACTIONS.LOAD_CONTAINERS_SUCCESS, ACTIONS.LOAD_CONTAINERS_FAIL],
    id: clusterId,
    promise: (client) => client.get(`/ui/api/clusters/${clusterId}/containers`)
  };
}

export function loadNodes(clusterId) {
  return {
    types: [ACTIONS.LOAD_NODES, ACTIONS.LOAD_NODES_SUCCESS, ACTIONS.LOAD_NODES_FAIL],
    id: clusterId,
    promise: (client) => client.get(`/ui/api/clusters/${clusterId}/nodes`)
  };
}

export function loadDefaultParams({clusterId, image, tag}) {
  return {
    types: [ACTIONS.LOAD_DEFAULT_PARAMS, ACTIONS.LOAD_DEFAULT_PARAMS_SUCCESS, ACTIONS.LOAD_DEFAULT_PARAMS_FAIL],
    id: clusterId,
    image: image,
    tag: tag,
    promise: (client) => client.get(`/ui/api/clusters/${clusterId}/defaultparams/${image}/${tag}/`)
  };
}
