import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import * as settingsActions from 'redux/modules/settings/settings';

@connect(
  state => ({
    settings: state.settings
  }), {
    setSettings: settingsActions.setSettings,
    getSettings: settingsActions.getSettings
  })
export default class ApplicationPanel extends Component {
    
}
