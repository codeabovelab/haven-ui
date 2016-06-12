import {ACTIONS} from './actions';
import _ from 'lodash';

const MAX_LAST_EVENTS = 20;
export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    case ACTIONS.NEW:
      let lastOld = _.get(state, 'last', []);
      let last = [...lastOld];
      let data = {...action.event};
      if (!data.created) {
        data.created = new Date();
      }
      last.unshift(data);
      if (last.length > MAX_LAST_EVENTS) {
        last.pop();
      }
      return {...state, last};
    default:
      return state;
  }
}
