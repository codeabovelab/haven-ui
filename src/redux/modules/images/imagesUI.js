import {ACTIONS} from './actions';
const initialState = {
  loading: false,
  loadingError: null,
  new_register: {
    adding: false,
    error: null
  }
};
export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case ACTIONS.ADD_REGISTER:
      return {
        ...state,
        new_register: {
          adding: true,
          error: null
        }
      };
    case ACTIONS.ADD_REGISTER_SUCCESS:
      return {
        ...state,
        new_register: {
          adding: false,
          error: null
        }
      };
    case ACTIONS.ADD_REGISTER_FAIL:
      return {
        ...state,
        new_register: {
          adding: false,
          error: "Cannot add registry"
        }
      };
    case ACTIONS.LOAD_IMAGES:
      return {
        ...state,
        loading: true,
        loadingError: null
      };
    case ACTIONS.LOAD_IMAGES_SUCCESS:
      return {
        ...state,
        loading: false
      };
    case ACTIONS.LOAD_IMAGES_FAIL:
      return {
        ...state,
        loading: false,
        loadingError: "Cannot load images"
      };
    default:
      return state;
  }
}
