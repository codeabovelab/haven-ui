import {ACTIONS} from './actions';
const initialState = {
  adding: false,
  addingError: null,
  editing: false,
  editingError: null,
  loading: false,
  loadingError: null,
  loaded: false
};
export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case ACTIONS.ADD_REGISTRY:
      return {
        ...state,
        adding: true,
        addingError: null
      };
    case ACTIONS.ADD_REGISTRY_SUCCESS:
      return {
        ...state,
        adding: false,
        addingError: null
      };
    case ACTIONS.ADD_REGISTRY_FAIL:
      return {
        ...state,
        adding: false,
        addingError: "Cannot add registry"
      };
    case ACTIONS.EDIT_REGISTRY:
      return {
        ...state,
        editing: true,
        editingError: null
      };
    case ACTIONS.EDIT_REGISTRY_SUCCESS:
      return {
        ...state,
        editing: false,
        editingError: null
      };
    case ACTIONS.EDIT_REGISTRY_FAIL:
      return {
        ...state,
        editing: false,
        editingError: "Cannot update registry"
      };
    case ACTIONS.LOAD_REGISTRIES:
      return {
        ...state,
        loading: true,
        loadingError: null
      };
    case ACTIONS.LOAD_REGISTRIES_SUCCESS:
      return {
        ...state,
        loading: false,
        loadingError: null,
        loaded: true
      };
    case ACTIONS.LOAD_REGISTRIES_FAIL:
      return {
        ...state,
        loading: false,
        loadingError: "Cannot load registries"
      };
    default:
      return state;
  }
}
