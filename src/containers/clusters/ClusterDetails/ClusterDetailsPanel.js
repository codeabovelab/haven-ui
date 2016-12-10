import React, {Component, PropTypes} from 'react';
import * as clusterActions from 'redux/modules/clusters/clusters';
import * as containerActions from 'redux/modules/containers/containers';
import {connect} from 'react-redux';
import {ContainerLog, ContainerDetails, ContainerStatistics, DockTable, Chain, LoadingDialog, StatisticsPanel, ActionMenu, ClusterUploadCompose, ClusterSetSource} from '../../../components/index';
import { Link, browserHistory, Route, RouteHandler } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import {ContainerCreate, ContainerScale, ContainerUpdate} from '../../../containers/index';
import { asyncConnect } from 'redux-async-connect';
import {deleteClusterImages} from 'redux/modules/images/images';
import {Dropdown, SplitButton, Button, ButtonGroup, DropdownButton, ButtonToolbar, MenuItem, Panel, ProgressBar, Nav, NavItem, Image} from 'react-bootstrap';
import _ from 'lodash';
import {downloadFile} from '../../../utils/fileActions';

function renderTdContainerName(row) {
  return (
    <td key="name" title={row.name}><Link to={"/clusters/" + row.cluster + "/containers/" + row.name}>{row.name}</Link></td>
  );
}

function renderTdApplication(row) {
  let resultValue = processTdVal(row.application);
  let val = resultValue.val.length ? [resultValue.val] : [];
  return (
    <td key="application" title={resultValue.title}>
      <Chain data={val || []}
             link={`/clusters/${row.cluster}/applications`}
             maxCount={1}
      />
    </td>
  );
}

function processTdVal(val) {
  const MAX_LENGTH = 25;
  let result = [];
  if (val) {
    result.title = val;
    let length = val.length;
    if (length >= MAX_LENGTH) {
      result.val = val.substring(0, MAX_LENGTH) + '...';
    } else {
      result.val = val;
    }
  } else {
    result.val = '';
    result.title = '';
  }
  return result;
}

function renderTdImage(row) {
  let name = row.image || '';
  let title = name ? name : '';
  let match = name.match(/[^/]+$/);
  name = match && match[0] ? match[0] : name;
  const MAX_LENGTH = 25;
  if (name) {
    if (name.length >= MAX_LENGTH) {
      name = '...' + name.substring(name.length - MAX_LENGTH, name.length);
    }
  }
  return (
    <td key="image">
      <span title={title}>{name}</span>
    </td>
  );
}

@asyncConnect([{
  promise: ({store: {dispatch, getState}}) => {
    const promises = [];

    if (!clusterActions.isLoaded(getState())) {
      promises.push(dispatch(clusterActions.load()));// actually we need just one cluster here, no API method for one
    }
    return Promise.all(promises);
  }
}])
@connect(
  state => ({
    clusters: state.clusters,
    containers: state.containers,
    events: state.events,
    users: state.users
  }), {
    loadContainers: clusterActions.loadContainers,
    loadClusters: clusterActions.load,
    deleteCluster: clusterActions.deleteCluster,
    startContainer: containerActions.start,
    stopContainer: containerActions.stop,
    restartContainer: containerActions.restart,
    removeContainer: containerActions.remove,
    getClusterSource: clusterActions.getClusterSource,
    deleteClusterImages
  })
export default class ClusterDetailsPanel extends Component {
  static propTypes = {
    clusters: PropTypes.object,
    containers: PropTypes.object,
    events: PropTypes.object,
    params: PropTypes.object,
    loadContainers: PropTypes.func.isRequired,
    deleteCluster: PropTypes.func.isRequired,
    startContainer: PropTypes.func.isRequired,
    stopContainer: PropTypes.func.isRequired,
    restartContainer: PropTypes.func.isRequired,
    removeContainer: PropTypes.func.isRequired,
    getClusterSource: PropTypes.func.isRequired,
    loadClusters: PropTypes.func.isRequired,
    deleteClusterImages: PropTypes.func.isRequired,
    users: PropTypes.object
  };

  statisticsMetricsNodesUp = [
    {
      type: 'number',
      title: 'Container Running',
      titles: 'Containers Running'
    },
    {
      type: 'number',
      title: 'Node Running',
      titles: 'Nodes Running'
    },
    {
      type: 'number',
      title: 'Application',
      titles: 'Applications'
    },
    {
      type: 'number',
      title: 'Event',
      titles: 'Events'
    }
  ];

  statisticsMetricsNodesDown = [
    {
      type: 'number',
      title: 'Container Running',
      titles: 'Containers Running'
    },
    {
      type: 'number',
      title: 'Node Down',
      titles: 'Nodes Down',
      highlight: true
    },
    {
      type: 'number',
      title: 'Application',
      titles: 'Applications'
    },
    {
      type: 'number',
      title: 'Event',
      titles: 'Events'
    }
  ];

  COLUMNS = [
    {
      name: 'name',
      render: renderTdContainerName,
    },

    {
      name: 'image',
      render: renderTdImage,
      width: '5%'
    },

    {
      name: 'node',
    },

    {
      name: 'application',
      render: renderTdApplication,
    },

    {
      name: 'status',
    },

    {
      name: 'actions',
      width: '5%'
    }
  ];

  GROUP_BY_SELECT = ['node', 'image', 'status'];

  STOPPED_ACTIONS = [
    {
      key: "log",
      title: "Show Log"
    },
    null,
    {
      key: "start",
      title: "Start",
      disabled: true
    },
    {
      key: "stop",
      title: "Stop",
      default: true
    },
    {
      key: "restart",
      title: "Restart"
    },
    null,
    {
      key: "edit",
      title: "Edit"
    },
    {
      key: "scale",
      title: "Scale"
    },
    {
      key: "details",
      title: "Details"
    },
    {
      key: "stats",
      title: "Stats"
    },
    null,
    {
      key: "delete",
      title: "Delete",
      disabled: true
    }
  ];

  RUN_ACTIONS = [
    {
      key: "log",
      title: "Show Log"
    },
    null,
    {
      key: "start",
      title: "Start",
      default: true
    },
    {
      key: "stop",
      title: "Stop",
      disabled: true
    },
    {
      key: "restart",
      title: "Restart",
      disabled: true
    },
    null,
    {
      key: "edit",
      title: "Edit"
    },
    {
      key: "scale",
      title: "Scale",
      disabled: true
    },
    {
      key: "details",
      title: "Details"
    },
    {
      key: "stats",
      title: "Stats",
      disabled: true
    },
    null,
    {
      key: "delete",
      title: "Delete",
      disabled: _.get(this.props.users, 'currentUser.role', '') === "ROLE_USER"
    }
  ];

  shouldComponentUpdate(nextProps, nextState) {
    const {loadContainers, params: {name}} = this.props;
    const nextName = nextProps.params.name;
    if (name !== nextName && nextName === 'all') {
      loadContainers(nextName);
    }
    return true;
  }

  componentDidMount() {
    const {loadContainers, loadClusters, params: {name}} = this.props;

    this.state = {};
    loadClusters();
    loadContainers(name);

    $('.input-search').focus();
  }

  renderTdCluster(row) {
    const {loadContainers} = this.props;
    let resultValue = processTdVal(row.cluster);
    return (
      <td key="cluster" title={resultValue.title}>
        <Link to={"/clusters/" + resultValue.val}
              onClick={() => {loadContainers(resultValue.val);}}>
          {resultValue.val}</Link></td>
    );
  }

  render() {
    const {containers, clusters, params: {name}} = this.props;
    const cluster = clusters[name];

    if (!cluster) {
      return (
        <div></div>
      );
    }


    const containersIds = cluster.containersList;
    const rows = containersIds == null ? null : containersIds.map(id => containers[id]);
    this.additionalData(rows);

    let runningContainers = 0;
    let runningNodes = 0;
    let downNodes = 0;
    let Apps = 0;
    let eventsCount = 0;
    let events = this.props.events['bus.cluman.errors-stats'];
    if (events) {
      if (name && name !== 'all') {
        events = _.filter(events, (el)=>(el.lastEvent.cluster === name));
      }
      _.forEach(events, (value, key) => {
        eventsCount += value.count;
      });
    }
    if (name === 'all') {
      _.forEach(clusters, (el)=> {
        Apps += _.size(el.applications);
      });
    } else {
      Apps = _.size(cluster.applications);
    }

    if (rows && rows.length > 0) {
      rows.forEach((container) => {
        if (container.run) {
          runningContainers++;
        }
      });
    }

    if (typeof(cluster.nodes.on) !== 'undefined') {
      runningNodes = cluster.nodes.on;
    }

    if (typeof(cluster.nodes.off) !== 'undefined') {
      downNodes = cluster.nodes.off;
    }

    const isAllPage = name === 'all';

    let columns = this.COLUMNS;
    let groupBySelect = this.GROUP_BY_SELECT;
    let nodesNavId = isAllPage ? "/nodes" : "/clusters/" + name + "/" + "nodes";
    if (isAllPage && columns[3].name !== 'cluster') {
      columns.splice(3, 0, {name: 'cluster', label: 'Cluster', render: this.renderTdCluster.bind(this)});
      groupBySelect.push('cluster');
    }
    if (!isAllPage) {
      columns = columns.filter((object)=> object.name !== 'cluster');
      groupBySelect = groupBySelect.filter((object)=> object !== 'cluster');
    } else {
      $('div.content-top').find('h1').text('Containers');
    }
    columns.forEach(column => column.sortable = column.name !== 'actions');

    return (
      <div key={name}>
        <ul className="breadcrumb">
          <li><Link to="/clusters">Clusters</Link></li>
          <li><Link to={"/clusters/" + name}>{name}</Link></li>
          <li className="active">Containers</li>
        </ul>
        {(runningNodes > 0 || runningNodes === downNodes) && (
          <StatisticsPanel metrics={this.statisticsMetricsNodesUp}
                           cluster={cluster}
                           values={[runningContainers, runningNodes, Apps, eventsCount]}
          />
        )}
        {(runningNodes === 0 && downNodes > 0) && (
          <StatisticsPanel metrics={this.statisticsMetricsNodesDown}
                           cluster={cluster}
                           values={[runningContainers, downNodes, Apps, eventsCount]}
          />
        )}
        <div className="panel panel-default">
          {!rows && (
            <ProgressBar active now={100} />
          )}

          {rows && (
            <div>
              <Nav bsStyle="tabs" className="dockTable-nav">
                <LinkContainer to={"/clusters/" + name}>
                  <NavItem eventKey={1}>Containers</NavItem>
                </LinkContainer>
                <LinkContainer to={"/clusters/" + name + "/" + "applications"}>
                  <NavItem eventKey={2} disabled={name === "all"}>Applications</NavItem>
                </LinkContainer>
                <LinkContainer to={nodesNavId}>
                  <NavItem eventKey={3}>Nodes</NavItem>
                </LinkContainer>
                <LinkContainer to={"/clusters/" + name + "/" + "events"}>
                  <NavItem eventKey={4}>Events</NavItem>
                </LinkContainer>
                <LinkContainer to={"/clusters/" + name + "/" + "registries"}>
                  <NavItem eventKey={5} disabled={name === "all"}>Registries</NavItem>
                </LinkContainer>
                <LinkContainer to={"/clusters/" + name + "/" + "images"}>
                  <NavItem eventKey={5} disabled={name === "all"}>Update</NavItem>
                </LinkContainer>
              </Nav>
              {!isAllPage && (
                <ButtonToolbar className="pulled-right-toolbar">
                  <Button
                    bsStyle="primary"
                    onClick={this.onActionInvoke.bind(this, "create")}
                  >
                    <i className="fa fa-plus"/>&nbsp;
                    New Container
                  </Button>

                  {false && <Button
                    bsStyle="danger"
                    onClick={this.deleteCluster.bind(this)}
                  >
                    <i className="fa fa-trash"/>&nbsp;
                    Delete Cluster
                  </Button>
                  }
                  <ButtonGroup>
                    <DropdownButton bsStyle="primary" pullRight className="pulled-right" title="More Actions">
                      <MenuItem eventKey="1"
                                bsStyle="default"
                                onClick={this.getClusterSource.bind(this)}
                      >
                        <i className="fa fa-download"/>&nbsp;
                        Download Config File
                      </MenuItem>
                      <MenuItem eventKey="2"
                                bsStyle="default"
                                onClick={this.setClusterSource.bind(this)}
                      >
                        <i className="fa fa-upload"/>&nbsp;
                        Upload Config File
                      </MenuItem>
                      <MenuItem eventKey="3"
                        bsStyle="default"
                        onClick={this.deployCompose.bind(this)}
                      >
                        <img src={require('../../../assets/img/black-octopus.png')}/>&nbsp;
                        Deploy Compose File
                      </MenuItem>
                      <MenuItem eventKey="4"
                                bsStyle="default"
                                onClick={this.onActionInvoke.bind(this, "deleteImages")}
                      >
                        <i className="fa fa-bomb"/>&nbsp;
                        Delete Images
                      </MenuItem>
                      </DropdownButton>
                  </ButtonGroup>
                </ButtonToolbar>
              )}
              <div className="containers">
                <DockTable columns={columns}
                           rows={rows}
                           key={name}
                           groupBy="node"
                           groupBySelect={groupBySelect}
                />
              </div>
            </div>
          )}

          {(rows && rows.length === 0) && (
            <div className="alert alert-info">
              No containers yet
            </div>
          )}
        </div>


        {(this.state && this.state.actionDialog) && (
          <div>
            {this.state.actionDialog}
          </div>
        )}
      </div>
    );
  }

  additionalData(rows) {
    if (rows) {
      rows.forEach(row => {
        row.__attributes = {'data-id': row.id};
        if (row.run) {
          row.__attributes['data-running'] = true;
        }
        row.actions = this.tdActions.bind(this);
      });
    }
  }

  tdActions(container) {
    let actions = (container.run) ? this.STOPPED_ACTIONS : this.RUN_ACTIONS;
    return (
      <td className="td-actions" key="actions">
        <ActionMenu subject={container.id}
                    actions={actions}
                    actionHandler={this.onActionInvoke.bind(this)}
        />

      </td>
    );
  }

  onHideDialog() {
    this.setState({
      actionDialog: undefined
    });
  }

  onActionInvoke(action, container) {
    const {clusters, params: {name}} = this.props;
    let cluster = clusters[name];

    console.log('onActionInvoke', action, cluster);

    let currentContainer;
    if (container) {
      currentContainer = this.props.containers[container];
    }
    console.log('container', container, currentContainer);

    switch (action) {
      case "create":
        this.setState({
          actionDialog: (
            <ContainerCreate title="Create New Container"
                             cluster={cluster}
                             onHide={this.onHideDialog.bind(this)}
            />
          )
        });
        return;

      case "log":
        this.setState({
          actionDialog: (
            <ContainerLog container={currentContainer}
                          onHide={this.onHideDialog.bind(this)}
            />
          )
        });
        return;

      case "details":
        this.setState({
          actionDialog: (
            <ContainerDetails container={currentContainer}
                              onHide={this.onHideDialog.bind(this)}
            />
          )
        });
        return;

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

      case "stats":
        this.setState({
          actionDialog: (
            <ContainerStatistics container={currentContainer}
                                 onHide={this.onHideDialog.bind(this)}
            />
          )
        });
        return;

      case "start":
        confirm('Are you sure you want to start container?')
          .then(() => {
            this.setState({
              actionDialog: (
                <LoadingDialog container={currentContainer}
                               onHide={this.onHideDialog.bind(this)}
                               name={name}
                               longTermAction={this.props.startContainer}
                               loadContainers={this.props.loadContainers}
                               actionKey="started"
                />
              )
            });
          });
        return;

      case "stop":
        confirm('Are you sure you want to stop container?')
          .then(() => {
            this.setState({
              actionDialog: (
                <LoadingDialog container={currentContainer}
                               onHide={this.onHideDialog.bind(this)}
                               name={name}
                               longTermAction={this.props.stopContainer}
                               loadContainers={this.props.loadContainers}
                               actionKey="stopped"
                />
              )
            });
          });
        return;

      case "deleteImages":
        confirm("Are you sure you want to delete unused images in cluster " + name + "?")
          .then(() => {
            this.props.deleteClusterImages(name).catch(() => null);
          })
          .catch(() => null);
        return;

      case "restart":
        confirm('Are you sure you want to restart container?')
          .then(() => {
            this.setState({
              actionDialog: (
                <LoadingDialog container={currentContainer}
                               onHide={this.onHideDialog.bind(this)}
                               name={name}
                               longTermAction={this.props.restartContainer}
                               loadContainers={this.props.loadContainers}
                               actionKey="restarted"
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
                               onHide={this.onHideDialog.bind(this)}
                               name={name}
                               longTermAction={this.props.removeContainer}
                               loadContainers={this.props.loadContainers}
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

  deleteCluster() {
    const {params: {name}, deleteCluster} = this.props;
    confirm('Are you sure you want to remove this cluster?')
      .then(() => {
        deleteCluster(name)
          .then(() => browserHistory.push('/clusters'));
      }, () => null);
  }

  getClusterSource() {
    const {getClusterSource, params: {name}} = this.props;
    getClusterSource(name).then((response)=> {
      let data = 'text/json;charset=utf-8,' + encodeURIComponent(response._res.text);
      downloadFile(data, name + '.yaml');
    }).catch(()=>null);
  }

  deployCompose() {
    const {params: {name}} = this.props;
    this.setState({
      actionDialog: (
        <ClusterUploadCompose title="Deploy Cluster From Compose File"
                              onHide={this.onHideDialog.bind(this)}
                              cluster={name}
        />
      )
    });
  }

  setClusterSource() {
    const {params: {name}} = this.props;
    this.setState({
      actionDialog: (
        <ClusterSetSource title={"Set " + name + " Cluster Source"}
                          cluster={name}
                          onHide={this.onHideDialog.bind(this)}
        />
      )
    });
  }

}
