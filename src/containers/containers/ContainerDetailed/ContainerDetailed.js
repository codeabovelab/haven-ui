import React, {Component, PropTypes} from 'react';
import * as clusterActions from 'redux/modules/clusters/clusters';
import * as containerActions from 'redux/modules/containers/containers';
import {connect} from 'react-redux';
import {PropertyGrid, LoadingDialog, ActionMenu, ContainerStatistics, EventLog} from '../../../components/index';
import {ContainerScale, ContainerUpdate, ContainerCreate} from '../../../containers/index';
import {Button, ButtonToolbar, Badge, Panel, ProgressBar, Tabs, Tab} from 'react-bootstrap';
import _ from 'lodash';
import {browserHistory} from 'react-router';
import { Stomp } from 'stompjs/lib/stomp.min.js';
import {connectToStomp} from '../../../utils/stompUtils';
import Helmet from 'react-helmet';
import {isInt} from 'utils/validation';

let stompClient = null;

@connect(state => ({
  clusters: state.clusters,
  containers: state.containers,
  containersByName: state.containers.detailsByName,
  containersUI: state.containersUI,
  events: state.events,
  token: state.auth.token,
  users: state.users
}), {
  loadContainers: clusterActions.loadContainers,
  loadClusters: clusterActions.load,
  loadStatistics: containerActions.loadStatistics,
  startContainer: containerActions.start,
  stopContainer: containerActions.stop,
  recreateContainer: containerActions.recreate,
  loadLogs: containerActions.loadLogs,
  loadDetailsByName: containerActions.loadDetailsByName,
  restartContainer: containerActions.restart,
  removeContainer: containerActions.remove})
export default class ContainerDetailed extends Component {
  static propTypes = {
    clusters: PropTypes.object.isRequired,
    containers: PropTypes.object,
    events: PropTypes.object,
    containersByName: PropTypes.object,
    container: PropTypes.object,
    containersUI: PropTypes.object,
    params: PropTypes.object,
    token: PropTypes.object,
    loadDetailsByName: PropTypes.func.isRequired,
    startContainer: PropTypes.func.isRequired,
    stopContainer: PropTypes.func.isRequired,
    recreateContainer: PropTypes.func.isRequired,
    loadContainers: PropTypes.func.isRequired,
    loadClusters: PropTypes.func.isRequired,
    loadLogs: PropTypes.func.isRequired,
    restartContainer: PropTypes.func.isRequired,
    removeContainer: PropTypes.func.isRequired,
    loadStatistics: PropTypes.func.isRequired,
    users: PropTypes.object
  };

  ACTIONS = [
    {
      key: "delete",
      title: "Delete",
      disabled: _.get(this.props.users, 'currentUser.role', '') === "ROLE_USER"
    },
    null,
    {
      key: "restart",
      title: "Restart"
    },
    null,
    {
      key: "scale",
      title: "Scale"
    },
    {
      key: "clone",
      title: "Clone"
    },
    {
      key: "recreate",
      title: "Recreate"
    },
    {
      key: "edit",
      title: "Edit",
      default: true
    },
    {
      key: "stats",
      title: "Stats"
    }
  ];

  componentWillMount() {
    require('./ContainerDetailed.scss');
    this.state = {
      containerErrors: []
    };
    const {loadDetailsByName, params: {name}, params: {subname}, loadClusters} = this.props;
    loadClusters();
    loadDetailsByName(name, subname).then(()=> {
      this.refreshLogs();
    });
  }

  componentDidMount() {
    const {token, params: {subname}} = this.props;
    connectToStomp(stompClient, token).then((connectedClient)=> {
      stompClient = connectedClient;
      stompClient.subscribe('/topic/**', (message) => {
        let newError = JSON.parse(message.body);
        if (_.get(newError, 'container.name', '') === subname) {
          this.setState({
            containerErrors: [...this.state.containerErrors, newError]
          });
        }
      });
    });
  }

  componentWillUnmount() {
    stompClient.disconnect();
    this.state.containerErrors = [];
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

  onActionInvoke(action, container) {
    const {params: {name}, clusters} = this.props;
    let currentContainer = container;
    const cluster = clusters[name];

    switch (action) {
      case "scale":
        this.setState({
          actionDialog: (
            <ContainerScale container={currentContainer}
                            onHide={this.onHideDialog.bind(this)}
                            name={name}
            />
          )
        });
        return;

      case "clone":
        this.setState({
          actionDialog: (
            <ContainerCreate title={`Clone Container "${currentContainer.name}"`}
                             cluster={cluster}
                             origin={currentContainer}
                             onHide={this.onHideDialog.bind(this)}
            />
          )
        });
        return;

      case "stats":
        this.setState({
          actionDialog: (
            <ContainerStatistics container={currentContainer}
                                 onHide={this.onHideDialog.bind(this)}
            />
          )
        });
        return;

      case "restart":
        this.setState({
          actionDialog: (
            <LoadingDialog container={currentContainer}
                           entityType="container"
                           onHide={this.onHideDialogAfterRestart.bind(this)}
                           name={name}
                           longTermAction={this.props.restartContainer}
                           refreshData={this.props.loadContainers}
                           actionKey="restarted"
            />
          )
        });
        return;

      case "recreate":
        confirm('Are you sure you want to recreate this container?')
          .then(() => {
            this.setState({
              actionDialog: (
                <LoadingDialog container={currentContainer}
                               entityType="container"
                               onHide={this.onHideDialogAfterRestart.bind(this)}
                               name={name}
                               longTermAction={this.props.recreateContainer}
                               refreshData={this.props.loadContainers}
                               actionKey="recreated"
                />
              )
            });
          });
        return;

      case "delete":
        confirm('Are you sure you want to remove this container?')
          .then(() => {
            this.setState({
              actionDialog: (
                <LoadingDialog container={currentContainer}
                               entityType="container"
                               onHide={this.onHideDialogAfterDelete.bind(this)}
                               name={name}
                               longTermAction={this.props.removeContainer}
                               refreshData={this.props.loadContainers}
                               actionKey="removed"
                />
              )
            });
          });
        return;

      case "edit":
        this.setState({
          actionDialog: (
            <ContainerUpdate container={currentContainer}
                             onHide={this.onHideDialog.bind(this)}
            />
          )
        });
        return;

      default:
        return;
    }
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

  onHideDialogAfterRestart() {
    const {loadDetailsByName, params: {name}, params: {subname}} = this.props;
    loadDetailsByName(name, subname);
    this.setState({
      actionDialog: undefined
    });
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

  processToggleResponse(action, name, container, loadDetailsByName) {
    action(container).then(()=> {
      loadDetailsByName(name, container.name);
    }).catch(()=> {
      loadDetailsByName(name, container.name);
    });
  }

  toggleCheckbox(e) {
    const {params: {subname}, params: {name}} = this.props;
    let containerLogChannel = 'container:' + name + ':' + subname + ':stdout';
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

  headerBar(clusterName, containersUI, startContainer, stopContainer, loadDetailsByName, container) {
    let containerStatus = container.run ? 'RUNNING' : 'EXITED';
    let loading = (containersUI[container.id] && (containersUI[container.id].starting || containersUI[container.id].stopping));
    let headerBar = '';
    if (container) {
      headerBar = (
        <div className="clearfix">
          <h3 id="containerDetailsHeader">{container.name}&nbsp;&nbsp;
            <Badge
              bsClass={"badge detailed-status-badge " + (container.run ? 'success-badge' : 'common-badge')}>{containerStatus}</Badge>&nbsp;&nbsp;
            {loading && (
              <i className="fa fa-spinner fa-pulse"/>
            )}
          </h3>
          <ButtonToolbar>
            {container.run && (
              <Button
                bsStyle="primary"
                onClick={()=> {
                  this.processToggleResponse(stopContainer, clusterName, container, loadDetailsByName);
                }}
              >
                <i className="fa fa-stop"/>&nbsp;Stop
              </Button>
            )}
            {!container.run && (
              <Button
                bsStyle="primary"
                onClick={()=> {
                  this.processToggleResponse(startContainer, clusterName, container, loadDetailsByName);
                }}
              >
                <i className="fa fa-play"/>&nbsp;Start
              </Button>
            )}
          </ButtonToolbar>
          <ActionMenu subject={container}
                      actions={this.ACTIONS}
                      actionHandler={this.onActionInvoke.bind(this)}
          />
        </div>
      );
    }
    return headerBar;
  }

  render() {
    const {containersByName, containersUI, params: {name}, params: {subname}, startContainer, stopContainer, loadDetailsByName} = this.props;
    const container = containersByName ? containersByName[subname] : null;
    let environment = {};
    if (container) {
      if (container.environment) {
        let index = 0;
        for (let prop in container.environment) {
          if (!container.environment.hasOwnProperty(prop)) {
            continue;
          }
          index++;
          let key = container.environment[prop].match(/([^=]+)={1,2}/);
          key = key && key[0] ? key[0] : index;
          let val = isInt(key) ? container.environment[prop] : container.environment[prop].substring(key.length);
          _.assign(environment, {[key]: val});
        }
      }
    }
    if (!container) {
      return (
        <div><ProgressBar active now={100} /></div>
      );
    }
    return (
      <div>
        <Helmet title="Container Detailed"/>
        <Panel header={this.headerBar(name, containersUI, startContainer, stopContainer, loadDetailsByName, container)}>
          <PropertyGrid data={_.assign({},
            {name: container.name}, {hostname: container.hostname}, {image: container.image},
            {cluster: container.cluster}, {node: container.node})}/>
        </Panel>
        <div className="panel panel-default">
          <Tabs defaultActiveKey={1} id="tabContainerProps">
            <Tab eventKey={1} title="Events">
              <EventLog data={this.state.containerErrors}
                        loading={!this.props.events}
              />
            </Tab>
            <Tab eventKey={2} title="Labels"><PropertyGrid data={container.labels}/></Tab>
            <Tab eventKey={3} title="Network & Ports"><PropertyGrid data={_.assign({},
              {publishAllPorts: container.publishAllPorts}, {ports: container.ports}, {network: container.network},
              {networks: container.networks}, {dns: container.dns}, {dnsSearch: container.dnsSearch},
              {extraHosts: container.extraHosts}, {domainname: container.domainname})}/></Tab>
            <Tab eventKey={4} title="CPU & Memory"><PropertyGrid data={_.assign({},
              {cpuShares: container.cpuShares}, {cpuQuota: container.cpuQuota}, {blkioWeight: container.blkioWeight},
              {cpuPeriod: container.cpuPeriod}, {cpusetCpus: container.cpusetCpus}, {cpusetMems: container.cpusetMems},
              {memoryLimit: container.memoryLimit}, {memorySwap: container.memorySwap}, {memoryReservation: container.memoryReservation},
              {kernelMemory: container.kernelMemory})}/></Tab>
            <Tab eventKey={5} title="Environment"><PropertyGrid data={environment}/></Tab>
            <Tab eventKey={6} title="Volumes"><PropertyGrid data={_.assign({},
              {volumes: container.volumes}, {volumeBinds: container.volumeBinds}, {volumeDriver: container.volumeDriver},
              {volumesFrom: container.volumesFrom}, {links: container.links})}/></Tab>
            <Tab eventKey={7} title="Security Opts & Args"><PropertyGrid data={_.assign({},
              {securityOpt: container.securityOpt}, {args: container.args})}/></Tab>
            <Tab eventKey={8} title="Time Stats"><PropertyGrid data={_.assign({},
              {created: container.created}, {started: container.started}, {finished: container.finished},
              {reschedule: container.reschedule}, {restartCount: container.restartCount}, {lock: container.lock},
              {lockCause: container.lockCause}, {command: container.command})}/></Tab>
            <Tab eventKey={9} title="Logs" onEnter={this.refreshLogs.bind(this)}>
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

