import {ACTIONS} from './actions';
const initialState = {
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
    default:
      return state;
  }
}
