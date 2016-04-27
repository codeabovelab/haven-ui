import {ACTIONS} from './actions';
const initState = {
  list: null
};

export default function reducer(state = initState, action = {}) {
  switch (action.type) {
    case ACTIONS.LOAD_SUCCESS:
      return {
        ...state,
        list: action.result.map(node => node.name)
      };
    default:
      return state;
  }
}
