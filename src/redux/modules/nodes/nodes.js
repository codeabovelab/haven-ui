import {ACTIONS} from './actions';
import _ from 'lodash';

export default function reducer(state = {}, action = {}) {
  let result;

  switch (action.type) {
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
        ..._.keyBy(result, 'name')
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
