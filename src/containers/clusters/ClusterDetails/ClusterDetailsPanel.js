import React, {Component, PropTypes} from 'react';
import * as clusterActions from 'redux/modules/clusters/clusters';
import * as containerActions from 'redux/modules/containers/containers';
import {connect} from 'react-redux';
import { Link, browserHistory } from 'react-router';
import {ContainerLog, ContainerDetails, ContainerStatistics, DockTable, LoadingDialog, StatisticsPanel, ActionMenu} from '../../../components/index';
import {ContainerCreate, ContainerScale} from '../../../containers/index';
import { asyncConnect } from 'redux-async-connect';
import {Dropdown, SplitButton, Button, ButtonToolbar, MenuItem, Panel, ProgressBar} from 'react-bootstrap';
import {list as listApplications} from 'redux/modules/application/application';
import _ from 'lodash';

function renderTdImage(row) {
  let resultValue = processTdVal(row.image);
  return (
    <td key="image" title={resultValue.title}>{resultValue.val}</td>
  );
}

function renderTdApplication(row) {
  let resultValue = processTdVal(row.application);
  return (
    <td key="application" title={resultValue.title}>{resultValue.val}</td>
  );
}

function processTdVal(val) {
  const MAX_LENGTH = 30;
  let result = [];
  result.val = val ? val : '';
  let length = result.val.length;
  result.title = "";
  if (length >= MAX_LENGTH + 5) {
    result.title = val;
    result.val = val.substring(0, MAX_LENGTH) + '...';
  }
  return result;
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
    application: state.application
  }), {
    loadContainers: clusterActions.loadContainers,
    deleteCluster: clusterActions.deleteCluster,
    startContainer: containerActions.start,
    stopContainer: containerActions.stop,
    restartContainer: containerActions.restart,
    removeContainer: containerActions.remove,
    listApplications
  })
export default class ClusterDetailsPanel extends Component {
  static propTypes = {
    clusters: PropTypes.object,
    containers: PropTypes.object,
    application: PropTypes.object,
    params: PropTypes.object,
    loadContainers: PropTypes.func.isRequired,
    deleteCluster: PropTypes.func.isRequired,
    startContainer: PropTypes.func.isRequired,
    stopContainer: PropTypes.func.isRequired,
    restartContainer: PropTypes.func.isRequired,
    removeContainer: PropTypes.func.isRequired,
    listApplications: PropTypes.func.isRequired
  };

  statisticsMetrics = [
    {
      type: 'number',
      title: 'Container Running',
      titles: 'Containers Running'
    },
    {
      type: 'number',
      title: 'Node in the Cluster',
      titles: 'Nodes in the Cluster'
    },
    {
      type: 'number',
      title: 'Running Job',
      titles: 'Running Jobs'
    }
  ];

  COLUMNS = [
    {
      name: 'name'
    },

    {
      name: 'image',
      render: renderTdImage
    },

    {
      name: 'node'
    },

    {
      name: 'status',
      width: '15%'
    },

    {
      name: 'application',
      render: renderTdApplication
    },

    {
      name: 'actions',
      width: '50px'
    }
  ];

  GROUP_BY_SELECT = ['node', 'image', 'status'];

  ACTIONS = [
    {
      key: "log",
      title: "Show Log",
      default: true
    },
    null,
    {
      key: "start",
      title: "Start"
    },
    {
      key: "stop",
      title: "Stop"
    },
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
      title: "Delete"
    }
  ];

  componentDidMount() {
    const {loadContainers, listApplications, params: {name}} = this.props;

    this.state = {};

    loadContainers(name);
    listApplications(name);

    $('.input-search').focus();
  }

  render() {
    let s = require('./ClusterDetailsPanel.scss');
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
    let runningJobs = 0;
    let errorCount = 0;


    if (rows && rows.length > 0) {
      rows.forEach((container) => {
        if (container.run) {
          runningContainers++;
        }
      });
    }

    if (typeof(cluster.nodes.on) !== 'undefined' && typeof(cluster.nodes.off) !== 'undefined') {
      runningJobs = cluster.nodes.on;
      runningNodes = cluster.nodes.off + cluster.nodes.on;
    }

    const containersHeaderBar = (
      <div className="clearfix">
        <h3>Containers</h3>

        <ButtonToolbar>
          <Button
            bsStyle="primary"
            onClick={this.onActionInvoke.bind(this, "create")}
          >
            <i className="fa fa-plus" />&nbsp;
            New Container
          </Button>

          {false && <Button
            bsStyle="danger"
            onClick={this.deleteCluster.bind(this)}
          >
            <i className="fa fa-trash" />&nbsp;
            Delete Cluster
          </Button>
          }
        </ButtonToolbar>
      </div>
    );

    const eventsHeaderBar = (
      <div className="clearfix">
        <h3>Events</h3>
      </div>
    );
    const isContainersPage = name === 'all';
    let columns = this.COLUMNS;
    let groupBySelect = this.GROUP_BY_SELECT;
    if (isContainersPage && columns[3].name !== 'cluster') {
      columns.splice(3, 0, {name: 'cluster', label: 'Cluster'});
      groupBySelect.push('cluster');
    }
    columns.forEach(column => column.sortable = column.name !== 'actions');

    return (
      <div>
        <StatisticsPanel metrics={this.statisticsMetrics}
                         values={[runningContainers, runningNodes, runningJobs, errorCount]}
        />

        {isContainersPage && (
          <h1>
            Containers
          </h1>
        )}
        {!isContainersPage && (
          <h1>
            <Link to="/clusters">Clusters</Link> / {name}
          </h1>
        )}

        <Panel header={containersHeaderBar}>
          {!rows && (
            <ProgressBar active now={100} />
          )}

          {(rows && rows.length > 0) && (
            <div>
              <div className="containers">
                <DockTable columns={columns}
                           rows={rows}
                           key={name}
                           groupBy="node"
                           groupBySelect={groupBySelect}
                           size={DockTable.SIZES.SM}
                />
              </div>
            </div>
          )}

          {(rows && rows.length === 0) && (
            <div className="alert alert-info">
              No containers yet
            </div>
          )}
        </Panel>

        <Panel header={eventsHeaderBar}>
          {!rows && (
            <ProgressBar active now={100} />
          )}
        </Panel>

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
    return (
      <td className="td-actions" key="actions">
        <ActionMenu subject={container.id}
                    actions={this.ACTIONS}
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

}
