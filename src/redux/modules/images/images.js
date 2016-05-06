import {ACTIONS} from './actions';
import _ from 'lodash';

export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    case ACTIONS.LOAD_IMAGES_SUCCESS:
      return mapLoadImagesToState(action.result);
    default:
      return state;
  }
}

function mapLoadImagesToState(data) {
  let state = {};
  data.forEach(register => {
    state[register.name] = register.repositories.map(name => ({name, register: register.name}));
  });
  return state;
}

export function loadImages() {
  return {
    types: [ACTIONS.LOAD_IMAGES, ACTIONS.LOAD_IMAGES_SUCCESS, ACTIONS.LOAD_IMAGES_FAIL],
    promise: (client) => client.get(`/ui/api/listCatalogs`)
  };
}
