import {ACTIONS} from './actions';
import _ from 'lodash';

const initialState = {
  agent: '' //* it means that get_agent cmd is not yet loaded */
};

export default function reducer(state = initialState, action = {}) {
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
    case ACTIONS.GET_APP_INFO_SUCCESS:
      return {
        ...state,
        version: action.result
      };
    case ACTIONS.GET_AGENT_SUCCESS:
      return {
        ...state,
        agent: _.get(action.result, '_res.text', '')
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

export function getAppInfo() {
  return {
    types: [ACTIONS.GET_APP_INFO, ACTIONS.GET_APP_INFO_SUCCESS, ACTIONS.GET_APP_INFO_FAIL],
    promise: (client) => client.get(`/ui/api/version`)
  };
}

export function getAgent() {
  return {
    types: [ACTIONS.GET_AGENT, ACTIONS.GET_AGENT_SUCCESS, ACTIONS.GET_AGENT_FAIL],
    promise: (client) => client.get(`/discovery/agent/`)
  };
}
