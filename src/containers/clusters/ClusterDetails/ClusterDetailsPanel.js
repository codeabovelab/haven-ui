import React, {Component, PropTypes} from 'react';
import * as clusterActions from 'redux/modules/clusters/clusters';
import * as containerActions from 'redux/modules/containers/containers';
import {connect} from 'react-redux';
import { Link, browserHistory } from 'react-router';
import {ContainerLog, ContainerDetails, ContainerStatistics, DockTable, Chain, LoadingDialog, StatisticsPanel, ActionMenu} from '../../../components/index';
import {ContainerCreate, ContainerScale, ContainerUpdate} from '../../../containers/index';
import { asyncConnect } from 'redux-async-connect';
import {Dropdown, SplitButton, Button, ButtonToolbar, MenuItem, Panel, ProgressBar} from 'react-bootstrap';
import _ from 'lodash';

function renderTdCluster(row) {
  let resultValue = processTdVal(row.cluster);
  return (
    <td key="cluster" title={resultValue.title}><Link to={"/clusters/" + resultValue.val}>{resultValue.val}</Link></td>
  );
}

function renderTdImage(row) {
  let resultValue = processTdVal(row.image);
  return (
    <td key="image" title={resultValue.title}>{resultValue.val}</td>
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
  let result = [];
  result.val = val ? val : '';
  result.title = "";
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
    events: state.events
  }), {
    loadContainers: clusterActions.loadContainers,
    deleteCluster: clusterActions.deleteCluster,
    startContainer: containerActions.start,
    stopContainer: containerActions.stop,
    restartContainer: containerActions.restart,
    removeContainer: containerActions.remove
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
    removeContainer: PropTypes.func.isRequired
  };

  statisticsMetrics = [
    {
      type: 'number',
      title: 'Container Running',
      titles: 'Containers Running',
      link: '/containers'
    },
    {
      type: 'number',
      title: 'Node Running',
      titles: 'Nodes Running',
      link: '/nodes'
    },
    {
      type: 'number',
      title: 'Application',
      titles: 'Applications',
      link: '/applications'
    },
    {
      type: 'number',
      title: 'Event',
      titles: 'Events',
      link: '/events'
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
      name: 'application',
      render: renderTdApplication
    },

    {
      name: 'status',
      width: '15%'
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
      title: "Delete"
    }
  ];

  componentDidMount() {
    const {loadContainers, params: {name}} = this.props;

    this.state = {};

    loadContainers(name);

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
    let Apps = 0;
    let eventsCount = 0;
    let events = this.props.events['bus.cluman.errors'];
    if (events) {
      eventsCount = name === 'all' ? _.size(events) : _.size(events.filter((el)=>(el.cluster === name)));
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

    const isContainersPage = name === 'all';
    let columns = this.COLUMNS;
    let groupBySelect = this.GROUP_BY_SELECT;
    if (isContainersPage && columns[3].name !== 'cluster') {
      columns.splice(3, 0, {name: 'cluster', label: 'Cluster', render: renderTdCluster});
      groupBySelect.push('cluster');
    }
    if (isContainersPage) {
      $('div.content-top').find('h1').text('Containers');
    }
    columns.forEach(column => column.sortable = column.name !== 'actions');

    return (
      <div>
        <ul className="breadcrumb">
          <li><a href="/clusters">Clusters</a></li>
          <li className="active">{name}</li>
        </ul>
        <StatisticsPanel metrics={this.statisticsMetrics}
                         link
                         cluster={cluster}
                         values={[runningContainers, runningNodes, Apps, eventsCount]}
        />

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

}
