import React, {Component, PropTypes} from 'react';
import * as clusterActions from 'redux/modules/clusters/clusters';
import * as containerActions from 'redux/modules/containers/containers';
import {connect} from 'react-redux';
import {PropertyGrid, LoadingDialog} from '../../../components/index';
import {ContainerScale, ContainerUpdate} from '../../../containers/index';
import {Dropdown, SplitButton, Button, ButtonToolbar, Accordion, Panel, ProgressBar, Tabs, Tab} from 'react-bootstrap';
import _ from 'lodash';
import {browserHistory} from 'react-router';
import { Stomp } from 'stompjs/lib/stomp.min.js';
import {connectToStomp} from '../../../utils/stompUtils';

let stompClient = null;

@connect(state => ({
  clusters: state.clusters,
  containers: state.containers,
  containersByName: state.containers.detailsByName,
  containersUI: state.containersUI,
  token: state.auth.token
}), {
  loadContainers: clusterActions.loadContainers,
  loadStatistics: containerActions.loadStatistics,
  startContainer: containerActions.start,
  stopContainer: containerActions.stop,
  loadLogs: containerActions.loadLogs,
  loadDetailsByName: containerActions.loadDetailsByName,
  restartContainer: containerActions.restart,
  removeContainer: containerActions.remove})
export default class ContainerDetailed extends Component {
  static propTypes = {
    clusters: PropTypes.object.isRequired,
    containers: PropTypes.object,
    containersByName: PropTypes.object,
    container: PropTypes.object,
    containersUI: PropTypes.object,
    params: PropTypes.object,
    token: PropTypes.object,
    loadDetailsByName: PropTypes.func.isRequired,
    startContainer: PropTypes.func.isRequired,
    stopContainer: PropTypes.func.isRequired,
    loadContainers: PropTypes.func.isRequired,
    loadLogs: PropTypes.func.isRequired,
    removeContainer: PropTypes.func.isRequired,
    loadStatistics: PropTypes.func.isRequired
  };

  componentWillMount() {
    require('./ContainerDetailed.scss');
    const {loadDetailsByName, params: {name}, params: {subname}} = this.props;
    loadDetailsByName(name, subname).then(()=> {
      this.refreshLogs();
    });
  }

  componentDidMount() {
    const {token} = this.props;
    stompClient = connectToStomp(stompClient, token);
  }

  componentWillUnmount() {
    stompClient.disconnect();
  }

  updateContainer() {
    const {containersByName, params: {subname}} = this.props;
    this.setState({
      actionDialog: (
        <ContainerUpdate container={containersByName[subname]}
                         onHide={this.onHideDialog.bind(this)}
        />
      )
    });
  }

  scaleContainer() {
    const {containersByName, params: {subname}} = this.props;
    this.setState({
      actionDialog: (
        <ContainerScale container={containersByName[subname]}
                        onHide={this.onHideDialog.bind(this)}
        />
      )
    });
  }

  deleteContainer() {
    const {containersByName, params: {subname}, params: {name}} = this.props;
    confirm('Are you sure you want to remove this container?')
      .then(() => {
        this.setState({
          actionDialog: (
            <LoadingDialog container={containersByName[subname]}
                           onHide={this.onHideDialogAfterDelete.bind(this)}
                           name={name}
                           longTermAction={this.props.removeContainer}
                           loadContainers={this.props.loadContainers}
                           actionKey="removed"
            />
          )
        });
      });
  }

  onHideDialog() {
    this.setState({
      actionDialog: undefined
    });
  }

  onHideDialogAfterDelete() {
    const {params: {name}} = this.props;
    this.setState({
      actionDialog: undefined
    });
    browserHistory.push(`/clusters/${name}`);
  }

  refreshLogs() {
    const {loadLogs, containersByName, params: {subname}} = this.props;
    loadLogs(containersByName[subname]).then((response)=> {
      let $containerLog = $('#containerLog');
      $containerLog.val(response._res.text);
      if ($containerLog.length) {
        $containerLog.scrollTop($containerLog[0].scrollHeight - $containerLog.height());
      }
    });
  }

  refreshStats() {
    const {loadStatistics, containersByName, params: {subname}} = this.props;
    loadStatistics(containersByName[subname]);
  }

  processToggleResponse(action, name, container, loadDetailsByName) {
    action(container).then(()=> {
      loadDetailsByName(name, container.name);
    }).catch(()=> {
      loadDetailsByName(name, container.name);
    });
  }

  toggleCheckbox(e) {
    const {params: {subname}} = this.props;
    let containerLogChannel = 'container:' + subname + ':stdout';
    let checked = e.target.checked;
    if (checked === true) {
      stompClient.subscribe('/user/queue/*', (message) => {
        let entry = JSON.parse(message.body).message;
        if (message.headers && message.body && checked) {
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
    const {containersByName, containersUI, params: {name}, params: {subname}, startContainer, stopContainer, loadDetailsByName} = this.props;
    const container = containersByName ? containersByName[subname] : null;
    let loading = '';
    let containerHeaderBar = '';
    if (container) {
      let containerStatus = container.run ? 'RUNNING' : 'EXITED';
      loading = (containersUI[container.id] && (containersUI[container.id].starting || containersUI[container.id].stopping));
      containerHeaderBar = (
        <div className="clearfix">
          <h3 id="containerDetailsHeader">{container.name}&nbsp;&nbsp;
              <span className={container.run ? 'success-header' : ''}>{containerStatus}</span>&nbsp;&nbsp;
            {loading && (
              <i className="fa fa-spinner fa-pulse"/>
            )}
          </h3>
          <ButtonToolbar>
            {container.run && (
              <Button
                bsStyle="primary"
                onClick={()=> {
                  this.processToggleResponse(stopContainer, name, container, loadDetailsByName);
                }}
              >
                <i className="fa fa-stop"/>&nbsp;Stop
              </Button>
            )}
            {!container.run && (
              <Button
                bsStyle="primary"
                onClick={()=> {
                  this.processToggleResponse(startContainer, name, container, loadDetailsByName);
                }}
              >
                <i className="fa fa-play"/>&nbsp;Start
              </Button>
            )}
            <Button
              bsStyle="default"
              onClick={this.updateContainer.bind(this)}
            >
              Update
            </Button>&nbsp;&nbsp;
          </ButtonToolbar>
        </div>
      );
    }
    if (!container) {
      return (
        <div><ProgressBar active now={100} /></div>
      );
    }

    return (
      <div>
        <ul className="breadcrumb">
          <li><a href="/clusters">Clusters</a></li>
          <li><a href={"/clusters" + "/" + name}>{name}</a></li>
          <li className="active">{subname}</li>
        </ul>
        <Panel header={containerHeaderBar}>
          <PropertyGrid data={_.assign({},
            {name: container.name}, {hostname: container.hostname}, {image: container.image},
            {cluster: container.cluster}, {node: container.node})}/>
        </Panel>
        <div className="panel panel-default">
          <Tabs defaultActiveKey={1} id="tabContainerProps">
            <Tab eventKey={1} title="Labels"><PropertyGrid data={container.labels}/></Tab>
            <Tab eventKey={2} title="Network&Ports"><PropertyGrid data={_.assign({},
              {publishAllPorts: container.publishAllPorts}, {ports: container.ports}, {network: container.network},
              {networks: container.networks}, {dns: container.dns}, {dnsSearch: container.dnsSearch},
              {extraHosts: container.extraHosts}, {domainname: container.domainname})}/></Tab>
            <Tab eventKey={3} title="CPU & Memory"><PropertyGrid data={_.assign({},
              {cpuShares: container.cpuShares}, {cpuQuota: container.cpuQuota}, {blkioWeight: container.blkioWeight},
              {cpuPeriod: container.cpuPeriod}, {cpusetCpus: container.cpusetCpus}, {cpusetMems: container.cpusetMems},
              {memoryLimit: container.memoryLimit}, {memorySwap: container.memorySwap}, {memoryReservation: container.memoryReservation},
              {kernelMemory: container.kernelMemory})}/></Tab>
            <Tab eventKey={4} title="Environment"><PropertyGrid data={container.environment}/></Tab>
            <Tab eventKey={5} title="Volumes"><PropertyGrid data={_.assign({},
              {volumes: container.volumes}, {volumeBinds: container.volumeBinds}, {volumeDriver: container.volumeDriver},
              {volumesFrom: container.volumesFrom}, {links: container.links})}/></Tab>
            <Tab eventKey={6} title="Security Opts & Args"><PropertyGrid data={_.assign({},
              {securityOpt: container.securityOpt}, {args: container.args})}/></Tab>
            <Tab eventKey={7} title="Time Stats"><PropertyGrid data={_.assign({},
              {created: container.created}, {started: container.started}, {finished: container.finished},
              {reschedule: container.reschedule}, {restartCount: container.restartCount}, {lock: container.lock},
              {lockCause: container.lockCause}, {command: container.command})}/></Tab>
            <Tab eventKey={8} title="Logs" onEnter={this.refreshLogs.bind(this)}>
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
                        id="containerLog"
                        defaultValue=""
              />
            </Tab>
          </Tabs>
          </div>

        {(this.state && this.state.actionDialog) && (
          <div>
            {this.state.actionDialog}
          </div>
        )}
      </div>
    );
  }

}

