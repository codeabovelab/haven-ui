import { ACTIONS } from './actions';
import _ from 'lodash';

const MAX_LAST_EVENTS = 50;

export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    case ACTIONS.NEW:
      let result;
      console.log(action.event);
      if (action.topic === 'bus.cluman.errors-stats') {
        result = {
          ...state,
          [action.topic]: {
            ...state[action.topic],
            [action.event.key]: action.event
          }
        };
      } else {
        let lastOld = _.get(state, action.topic, []);
        let last = [...lastOld];
        let data = action.event;
        last.unshift(data);
        if (last.length > MAX_LAST_EVENTS) {
          last.pop();
        }
        result = {
          ...state,
          [action.topic]: last
        };
      }
      return result;

    case ACTIONS.COUNT_SUCCESS:
      let resultFiltered = action.result.filtered;
      let atAll = action.result.count;
      let alerts = {};

      resultFiltered.map((element)=> {
        alerts[element.filter.replace('cluster:', '')] = {alertsCount: element.count};
      });

      alerts.atAll = atAll;

      return {
        ...state,
        alerts
      };

    default:
      return state;
  }
}

export function count(source, data) {
  return {
    types: [
      ACTIONS.COUNT,
      ACTIONS.COUNT_SUCCESS,
      ACTIONS.COUNT_FAIL
    ],
    id: source,
    promise: (client) => client.get(`/ui/api/events/${source}/count`, {params: {filter: data}})
  };
}
