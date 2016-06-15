import {ACTIONS} from './actions';
const initialState = {
  adding: false,
  addingError: null,
  loaded: false
};
export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case ACTIONS.ADD_REGISTER:
      return {
        ...state,
        adding: true,
        addingError: null
      };
    case ACTIONS.ADD_REGISTER_SUCCESS:
      return {
        ...state,
        adding: false,
        addingError: null
      };
    case ACTIONS.ADD_REGISTER_FAIL:
      return {
        ...state,
        adding: false,
        addingError: "Cannot add registry"
      };
    case ACTIONS.LOAD_REGISTRIES_SUCCESS:
      return {
        ...state,
        loaded: true
      };
    default:
      return state;
  }
}
