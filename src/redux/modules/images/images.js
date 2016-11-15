import {ACTIONS} from './actions';
import _ from 'lodash';

const initialState = {
  byRegistry: {},
  all: null /* it mean that images not yet loaded */,
  tagInfo: {}
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
          ...action.result
        }
      };
    case ACTIONS.LOAD_IMAGE_TAG_INFO_SUCCESS:
      return {
        ...state,
        tagInfo: {
          ...state.tagInfo,
          [action.image]: {
            ...action.result
          }
        }
      };
    case ACTIONS.LOAD_IMAGE_TAG_INFO_FAIL:
      return {
        ...state,
        tagInfo: {
          ...state.tagInfo,
          [action.image]: {
            error: action.error
          }
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
    //also calculate simple list of nodes on which image is installed
    image.nodes = getNodes(image);
  });
  return state;
}

function getNodes(image) {
  let data = image.ids || [];
  if (data.length) {
    data = data.map(img => img.nodes)
      .reduce((a, b) => a.concat(b))
      .sort()
      .reduce((a, b) => {if (a[a.length - 1] !== b) a.push(b); return a;}, []);
  }
  return data;
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

export function loadImageTagInfo(imageName) {
  return {
    types: [ACTIONS.LOAD_IMAGE_TAG_INFO, ACTIONS.LOAD_IMAGE_TAG_INFO_SUCCESS, ACTIONS.LOAD_IMAGE_TAG_INFO_FAIL],
    image: imageName,
    promise: (client) => client.get('/ui/api/images/image', {params: {fullImageName: imageName }})
  };
}


export function searchImages(query, page, size, registry) {
  return {
    types: [ACTIONS.SEARCH_IMAGES, ACTIONS.SEARCH_IMAGES_SUCCESS, ACTIONS.SEARCH_IMAGES_FAIL],
    id: 'search',
    promise: (client) => client.get('/ui/api/images/search', {params: {registry: registry, query: query, page: page, size: size}})
  };
}

export function deleteImages(arg) {
  let body = {
    type: "job.removeImageJob",
    parameters: {
      //TODO after debug "dryRun":false,
      random: new Date().toUTCString(), //this line allow to create new job at each call
      dryRun: arg.dryRun,
      retainLast: arg.retainLast,
      nodes: arg.nodes,
      fullImageName: arg.name,
      fromRegistry: arg.fromRegistry
    }
  };
  return {
    types: [ACTIONS.DELETE_IMAGES, ACTIONS.DELETE_IMAGES_SUCCESS, ACTIONS.DELETE_IMAGES_FAIL],
    id: 'delete',
    promise: (client) => client.post('/ui/api/jobs/', {data: body})
  };
}

export function deleteClusterImages(cluster) {
  let body = {
    type: "job.removeClusterImages",
    title: "Delete images in cluster \"" + cluster + "\"",
    parameters: {
      clusterName: cluster
    }
  };
  return {
    types: [ACTIONS.DELETE_CLUSTER_IMAGES, ACTIONS.DELETE_CLUSTER_IMAGES_SUCCESS, ACTIONS.DELETE_CLUSTER_IMAGES_FAIL],
    promise: (client) => client.post('/ui/api/jobs/', {data: body})
  };
}

