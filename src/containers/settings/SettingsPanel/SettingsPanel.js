import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import * as settingsActions from 'redux/modules/settings/settings';
import {UploadSettings} from '../../../components/index';
import {ProgressBar} from 'react-bootstrap';
import {downloadFile} from '../../../utils/fileActions';
import TimeUtils from 'utils/TimeUtils';

@connect(
  state => ({
    settings: state.settings
  }), {
    setSettings: settingsActions.setSettings,
    getSettings: settingsActions.getSettings,
    getAppInfo: settingsActions.getAppInfo,
  })
export default class SettingsPanel extends Component {

  static propTypes = {
    settings: PropTypes.object,
    getSettings: PropTypes.func,
    setSettings: PropTypes.func,
    getAppInfo: PropTypes.func
  };

  componentDidMount() {
    require('./SettingsPanel.scss');
    this.props.getSettings();
    this.props.getAppInfo();
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
                        title="Upload Config File"
        />
      )
    });
  }

  render() {
    const version = this.props.settings.version;
    if (!version) {
      return <div><ProgressBar active now={100} /></div>;
    }
    return (
      <div>
        <h4><a href="https://github.com/codeabovelab/haven-platform" target="_blank">Haven</a></h4>
        <div className="settingsList">
          <p>Version: <a target="_blank" href={"https://github.com/codeabovelab/haven-platform/commit/" + version.buildRevision}>{version.version}</a></p>
          <p>Build Time: <span>{TimeUtils.format(version.buildTime)}</span></p>
          <div className = "settings-buttons-block">
            <a id="downloadSettingsFile" className="btn btn-default" onClick={this.getSettingsFile.bind(this)}>
              <i className="fa fa-download" />&nbsp;Download settings file</a>
            <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
            <a id="uploadSettingsFile" className="btn btn-default" onClick={this.showUploadSettingsDialog.bind(this)}>
              <i className="fa fa-upload" />&nbsp;Upload settings file</a>
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
      downloadFile(parsedData, 'haven-settings.json');
    }).catch(()=>null);
  }

}

