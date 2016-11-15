const _ACTIONS = {
  LOAD_IMAGES: 'LOAD_IMAGES',
  LOAD_IMAGES_SUCCESS: 'LOAD_IMAGES_SUCCESS',
  LOAD_IMAGES_FAIL: 'LOAD_IMAGES_FAIL',
  LOAD_IMAGE_TAGS: 'LOAD_IMAGE_TAGS',
  LOAD_IMAGE_TAGS_SUCCESS: 'LOAD_IMAGE_TAGS_SUCCESS',
  LOAD_IMAGE_TAGS_FAIL: 'LOAD_IMAGE_TAGS_FAIL',
  LOAD_IMAGE_TAG_INFO: 'LOAD_IMAGE_TAG_INFO',
  LOAD_IMAGE_TAG_INFO_SUCCESS: 'LOAD_IMAGE_TAG_INFO_SUCCESS',
  LOAD_IMAGE_TAG_INFO_FAIL: 'LOAD_IMAGE_TAG_INFO_FAIL',
  SEARCH_IMAGES: 'SEARCH_IMAGES',
  SEARCH_IMAGES_SUCCESS: 'SEARCH_IMAGES_SUCCESS',
  SEARCH_IMAGES_FAIL: 'SEARCH_IMAGES_FAIL',
  DELETE_IMAGES: 'DELETE_IMAGES',
  DELETE_IMAGES_SUCCESS: 'DELETE_IMAGES_SUCCESS',
  DELETE_IMAGES_FAIL: 'DELETE_IMAGES_FAIL',
  DELETE_CLUSTER_IMAGES: 'DELETE_CLUSTER_IMAGES',
  DELETE_CLUSTER_IMAGES_SUCCESS: 'DELETE_CLUSTER_IMAGES_SUCCESS',
  DELETE_CLUSTER_IMAGES_FAIL: 'DELETE_CLUSTER_IMAGES_FAIL'
};

Object.keys(_ACTIONS).forEach((key) => {
  _ACTIONS[key] = 'images/' + _ACTIONS[key];
});
export const ACTIONS = _ACTIONS;
