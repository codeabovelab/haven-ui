import {ACTIONS} from './actions';
import _ from 'lodash';

const initialState = {
  byRegistry: {},
  all: []
};

export default function reducer(state = initialState, action = {}) {
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
  let state = {all: data, byRegistry: {}};
  let byRegistry = state.byRegistry;
  data.forEach(image => {
    let registry = image.registry;
    if (!byRegistry[registry]) {
      byRegistry[registry] = {};
    }
    byRegistry[registry][image.name] = image;
  });
  return state;
}

export function loadImages() {
  return {
    types: [ACTIONS.LOAD_IMAGES, ACTIONS.LOAD_IMAGES_SUCCESS, ACTIONS.LOAD_IMAGES_FAIL],
    promise: (client) => client.get('/ui/api/images/')
  };
}

export function loadImageTags(imageId) {
  return {
    types: [ACTIONS.LOAD_IMAGE_TAGS, ACTIONS.LOAD_IMAGE_TAGS_SUCCESS, ACTIONS.LOAD_IMAGE_TAGS_FAIL],
    image: imageId,
    promise: (client) => client.get(`/ui/api/images/tags?imageName=${imageId}`)
  };
}
