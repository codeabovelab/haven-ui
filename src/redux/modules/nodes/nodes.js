import {ACTIONS} from './actions';
import _ from 'lodash';

export default function reducer(state = {}, action = {}) {
  let result;

  switch (action.type) {
    case ACTIONS.LOAD:
      return {
        ...state,
        loading: true
      };
    case ACTIONS.LOAD_SUCCESS:
      result = action.result.map((node) => {
        let result = node;

        let netIn = 0;
        let netOut = 0;

        if (node.health && node.health.net) {
          _.reduce(node.health.net, (res, value, key) => {
            netIn += value.bytesIn;
            netOut += value.bytesOut;

            return 0;
          });

          result = Object.assign({}, node, {
            health: Object.assign({}, node.health, {
              netIn: netIn,
              netOut: netOut,
              netTotal: netIn + netOut
            })
          });
        }

        return result;
      });

      return {
        ...state,
        ..._.keyBy(result, 'name'),
        loading: false
      };
    case ACTIONS.LOAD_FAIL:
      return {
        ...state,
        loading: false
      };
    default:
      return state;
  }
}

export function load() {
  return {
    types: [ACTIONS.LOAD, ACTIONS.LOAD_SUCCESS, ACTIONS.LOAD_FAIL],
    promise: (client) => client.get('/ui/api/nodes/')
  };
}

export function create({name, cluster}) {
  return {
    types: [ACTIONS.CREATE, ACTIONS.CREATE_SUCCESS, ACTIONS.CREATE_FAIL],
    promise: (client) => client.post(`/ui/api/clusters/${cluster}/nodes/${name}`)
  };
}

export function remove({name, cluster}) {
  return {
    types: [ACTIONS.REMOVE, ACTIONS.REMOVE_SUCCESS, ACTIONS.REMOVE_FAIL],
    promise: (client) => client.del(`/ui/api/clusters/${cluster}/nodes/${name}`)
  };
}

export function add(name, address) {
  return {
    types: [ACTIONS.ADD, ACTIONS.ADD_SUCCESS, ACTIONS.ADD_FAIL],
    promise: (client) => client.put(`/ui/api/nodes/${name}`, {params: {address: address}})
  };
}
//address prop needed for loadingDialog unification
export function deleteNode(name, address) {
  return {
    types: [ACTIONS.DELETE, ACTIONS.DELETE_SUCCESS, ACTIONS.DELETE_FAIL],
    promise: (client) => client.del(`/ui/api/nodes/${name}`)
  };
}
