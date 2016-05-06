import {ACTIONS} from './actions';
import _ from 'lodash';

export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    case ACTIONS.LOAD_IMAGES_SUCCESS:
      return _.merge({}, state, mapLoadImagesToState(action.result));
    case ACTIONS.LOAD_IMAGE_TAGS_SUCCESS:
      let data = {
        [action.register]: {[action.image]: {tags: action.result.reverse()}}
      };
      return _.merge({}, state, data);
    default:
      return state;
  }
}

function mapLoadImagesToState(data) {
  let state = {};
  data.forEach(register => {
    state[register.name] = _.keyBy(register.repositories.map(name => ({name, register: register.name})), 'name');
  });
  return state;
}

export function loadImages() {
  return {
    types: [ACTIONS.LOAD_IMAGES, ACTIONS.LOAD_IMAGES_SUCCESS, ACTIONS.LOAD_IMAGES_FAIL],
    promise: (client) => client.get(`/ui/api/listCatalogs`)
  };
}

export function loadImageTags({image, register}) {
  return {
    types: [ACTIONS.LOAD_IMAGE_TAGS, ACTIONS.LOAD_IMAGE_TAGS_SUCCESS, ACTIONS.LOAD_IMAGE_TAGS_FAIL],
    image: image,
    register: register,
    promise: (client) => client.get(`/ui/api/image/${image}/tags`)
  };
}
