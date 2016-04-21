const TOGGLE = 'ml/TOGGLE';

const initialState = {
  toggled: false
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case TOGGLE:
      const {toggled} = state;
      return {
        toggled: !toggled
      };
    default:
      return state;
  }
}

export function toggle() {
  return {
    type: TOGGLE
  };
}
