import React, {Component, PropTypes} from 'react';
import * as containerActions from 'redux/modules/containers/containers';
import {Dialog} from 'components';
import {Row, Col, FormGroup, FormControl, Checkbox, ControlLabel, HelpBlock, Alert} from 'react-bootstrap';
import {connect} from 'react-redux';
import _ from 'lodash';
import { Stomp } from 'stompjs/lib/stomp.min.js';
import {connectToStomp} from '../../../utils/stompUtils';

let stompClient = null;

@connect(
  state => ({
    containers: state.containers,
    containersUI: state.containersUI,
    token: state.auth.token
  }),
  containerActions)
export default class ContainerLog extends Component {
  static propTypes = {
    containers: PropTypes.object.isRequired,
    containersUI: PropTypes.object.isRequired,
    container: PropTypes.object.isRequired,
    token: PropTypes.object,
    loadLogs: PropTypes.func.isRequired,

    onHide: PropTypes.func.isRequired
  };

  componentWillMount() {
    const {container, loadLogs} = this.props;
    loadLogs(container).then(()=> {
      let $containerLog = $('#containerLog');
      if ($containerLog.length) {
        $containerLog.scrollTop($containerLog[0].scrollHeight - $containerLog.height());
      }
    });
    require('jquery-ui/ui/widgets/draggable');
  }

  componentDidMount() {
    const {token} = this.props;
    $("#container-log-modal").draggable({handle: ".modal-header"});
    connectToStomp(stompClient, token).then((connectedClient)=> {
      stompClient = connectedClient;
    });
  }

  componentWillUpdate(nextProps) {
    const {container, loadLogs} = this.props;
    if (container.id !== nextProps.container.id) {
      loadLogs(nextProps.container);
    }
  }

  componentWillUnmount() {
    stompClient.disconnect();
  }

  toggleCheckbox(e) {
    const {container} = this.props;
    let containerLogChannel = 'container:' + container.cluster + ':' + container.name + ':stdout';
    let checked = e.target.checked;
    if (checked === true) {
      stompClient.subscribe('/user/queue/*', (message) => {
        if (message.headers && message.body && checked) {
          let entry = JSON.parse(message.body).message;
          $('#containerLog').val((_, val)=> {
            return val + '\n' + entry;
          });
        }
      });
      let yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      stompClient.send('/app/subscriptions/add', {}, JSON.stringify([{
        source: containerLogChannel,
        historyCount: 7,
        historySince: yesterday
      }]));
    } else {
      stompClient.send('/app/subscriptions/del', {}, JSON.stringify([containerLogChannel]));
    }
  }

  render() {
    let s = require('./ContainerLog.scss');
    const {container, containers, containersUI} = this.props;
    let containerDetailed = containers[container.id];
    let logs = containerDetailed.logs;
    logs = logs ? logs : "";

    let loadingLogs = _.get(containersUI, `[${container.id}].loadingLogs`, false);
    let error = _.get(containersUI, `[${container.id}].error`);

    let paragraphs = logs.split('\n').map(str => str.trim()).filter(str => str);
    return (
      <Dialog show
              hideCancel
              size="large"
              title={`Container Logs: ${container.name}`}
              okTitle="Close"
              onSubmit={this.props.onHide}
              onHide={this.props.onHide}
              modalId = "container-log-modal"
      >
        {loadingLogs && (
          <div className="text-xs-center">
            <i className="fa fa-spinner fa-5x fa-pulse"/>
          </div>
        )}

        {(!loadingLogs && error) && (
          <Alert bsStyle="danger">
            {error}
          </Alert>
        )}

        {(!loadingLogs && !error) && (
          <div>
            <div className="checkbox-button"><label>
              <input type="checkbox"
                     id="logCheck"
                     className="checkbox-control"
                     defaultChecked={false}
                     onChange={this.toggleCheckbox.bind(this)}
                     name="subscribeCheckBox"
              />
              <span className="checkbox-label">Real Time Log</span>
            </label></div>
            <textarea readOnly
                      className={s["container-log"]}
                      defaultValue={logs}
                      id="containerLog"
            />
          </div>
          )}
      </Dialog>
    );
  }
}
