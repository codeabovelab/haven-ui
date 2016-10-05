import {ACTIONS} from './actions';

export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    case ACTIONS.SET_SETTINGS:
      return {
        ...state,
        setSettingsError: null
      };
    case ACTIONS.SET_SETTINGS_FAIL:
      return {
        ...state,
        setSettingsError: action.error.message
      };
    case ACTIONS.GET_SETTINGS:
      return {
        ...state,
        getSettingsError: null
      };
    case ACTIONS.GET_SETTINGS_FAIL:
      return {
        ...state,
        getSettingsError: action.error.message
      };
    case ACTIONS.GET_SETTINGS_SUCCESS:
      return {
        ...state,
        settingsFile: {
          ...state.settingsFile,
          ...action.result
        }
      };
    default:
      return state;
  }
}

export function setSettings(formData) {
  return {
    types: [ACTIONS.SET_SETTINGS, ACTIONS.SET_SETTINGS_SUCCESS, ACTIONS.SET_SETTINGS_FAIL],
    promise: (client) => client.post(`/ui/api/config`, {data: formData})
  };
}

export function getSettings() {
  return {
    types: [ACTIONS.GET_SETTINGS, ACTIONS.GET_SETTINGS_SUCCESS, ACTIONS.GET_SETTINGS_FAIL],
    promise: (client) => client.get(`/ui/api/config`)
  };
}
