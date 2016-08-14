import React, {Component, PropTypes} from 'react';
import * as containerActions from 'redux/modules/containers/containers';
import {Dialog} from 'components';
import {Row, Col, FormGroup, FormControl, Checkbox, ControlLabel, HelpBlock} from 'react-bootstrap';
import {connect} from 'react-redux';
import _ from 'lodash';

@connect(
  state => ({
    containers: state.containers,
    containersUI: state.containersUI
  }),
  containerActions)
export default class ContainerLog extends Component {
  static propTypes = {
    containers: PropTypes.object.isRequired,
    containersUI: PropTypes.object.isRequired,
    container: PropTypes.object.isRequired,
    loadLogs: PropTypes.func.isRequired,

    fields: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func,
    resetForm: PropTypes.func,
    submitting: PropTypes.bool,
    createError: PropTypes.string,
    valid: PropTypes.bool.isRequired,
    registry: PropTypes.any,
    onHide: PropTypes.func.isRequired,
  };

  componentWillMount() {
    const {container, loadLogs} = this.props;
    loadLogs(container);
  }

  componentWillUpdate(nextProps) {
    const {container, loadLogs} = this.props;
    if (container.id !== nextProps.container.id) {
      loadLogs(nextProps.container);
    }
  }

  render() {
    let s = require('./ContainerLog.scss');
    const {container, containers, containersUI} = this.props;
    let containerDetailed = containers[container.id];
    let logs = containerDetailed.logs;
    logs = logs ? logs : "";
    let loadingLogs = _.get(containersUI, `[${container.id}].loadingLogs`, false);
    let paragraphs = logs.split('\n').map(str => str.trim()).filter(str => str);
    return (
      <Dialog show
              hideOk
              size="large"
              title={`Container Logs: ${container.name}`}
              cancelTitle="Close"
              onHide={this.props.onHide}
      >
        {loadingLogs && (
          <div className="text-xs-center">
            <i className="fa fa-spinner fa-5x fa-pulse"/>
          </div>
        )}

        {!loadingLogs && (
          <textarea readOnly
                    className={s["container-log"]}
          >
            {logs}
          </textarea>
        )}
      </Dialog>
    );
  }
}
