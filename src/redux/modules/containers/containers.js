import {ACTIONS as CLUSTER_ACTIONS} from '../clusters/actions';
import _ from 'lodash';

export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    case CLUSTER_ACTIONS.LOAD_CONTAINERS_SUCCESS:
      return {
        ...state,
        ..._.keyBy(action.result, 'name')
      };
    default:
      return state;
  }
}
