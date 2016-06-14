import {ACTIONS} from './actions';
const initialState = {
  adding: false,
  addingError: null
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
    default:
      return state;
  }
}
