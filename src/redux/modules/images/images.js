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
    case ACTIONS.SEARCH_IMAGES_SUCCESS:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          imageOpts: action.result
        }
      };
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
    promise: (client) => client.get('/ui/api/images/tags', {params: {imageName: imageId }})
  };
}

export function searchImages(query, page, size, registry) {
  return {
    types: [ACTIONS.SEARCH_IMAGES, ACTIONS.SEARCH_IMAGES_SUCCESS, ACTIONS.SEARCH_IMAGES_FAIL],
    id: 'search',
    promise: (client) => client.get('/ui/api/images/search', {params: {registry: registry, query: query, page: page, size: size}})
  };
}
