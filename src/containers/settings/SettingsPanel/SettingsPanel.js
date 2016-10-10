import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import * as settingsActions from 'redux/modules/settings/settings';
import {UploadSettings} from '../../../components/index';
import {ProgressBar} from 'react-bootstrap';

@connect(
  state => ({
    settings: state.settings
  }), {
    setSettings: settingsActions.setSettings,
    getSettings: settingsActions.getSettings
  })
export default class SettingsPanel extends Component {

  static propTypes = {
    settings: PropTypes.object,
    getSettings: PropTypes.func,
    setSettings: PropTypes.func
  };

  componentDidMount() {
    this.props.getSettings();
  }

  onHideDialog() {
    this.setState({
      actionDialog: undefined
    });
  }
  showUploadSettingsDialog() {
    this.setState({
      actionDialog: (
        <UploadSettings onHide={this.onHideDialog.bind(this)}
                        title="Upload Dockmaster's Config File"
        />
      )
    });
  }

  render() {
    const settingsFile = this.props.settings.settingsFile;
    if (!settingsFile) {
      return <div><ProgressBar active now={100} /></div>;
    }
    return (
      <div>
        <h3>Dockmaster</h3>
        <div className="settingsList">
          <p>Version: <span>{settingsFile.version}</span></p>
          <div className = "submit-buttons-block">
            <a id="downloadSettingsFile" className="btn btn-default" onClick={this.getSettingsFile.bind(this)}>Download settings file</a>
            <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
            <a id="uploadSettingsFile" className="btn btn-default" onClick={this.showUploadSettingsDialog.bind(this)}>Upload settings file</a>
          </div>
        </div>
        {(this.state && this.state.actionDialog) && (
          <div>
            {this.state.actionDialog}
          </div>
        )}
      </div>
    );
  }

  getSettingsFile() {
    this.props.getSettings().then(()=> {
      const settingsFile = this.props.settings.settingsFile;
      let wholeSettings = {version: settingsFile.version, date: settingsFile.date, data: settingsFile.data};
      let parsedData = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(wholeSettings));
      let $link = $('<a></a>').appendTo(document.body);
      $link.attr('href', 'data:' + parsedData);
      $link.attr('download', 'dockmaster-settings.json');
      $link.get(0).click();
      $link.remove();
    }).catch(()=>null);
  }

}

