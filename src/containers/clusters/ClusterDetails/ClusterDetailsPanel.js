import React, {Component, PropTypes} from 'react';
import * as clusterActions from 'redux/modules/clusters/clusters';
import * as containerActions from 'redux/modules/containers/containers';
import {connect} from 'react-redux';
import { Link, browserHistory } from 'react-router';
import {ContainerLog, ContainerDetails, ContainerStatistics, DockTable, StatisticsPanel, ActionMenu} from '../../../components/index';
import {ContainerCreate, ContainerScale} from '../../../containers/index';
import { asyncConnect } from 'redux-async-connect';
import {Dropdown, SplitButton, Button, ButtonToolbar, MenuItem, Panel, ProgressBar} from 'react-bootstrap';


const COLUMNS = [
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

  // {
  //   name: 'ports',
  //   label: 'Ports Mapping'
  // },

  {
    name: 'status',
    width: '15%'
  },

  {
    name: 'actions',
    width: '50px'
  }
];

COLUMNS.forEach(column => column.sortable = column.name !== 'actions');
const GROUP_BY_SELECT = ['node', 'image', 'status'];

function renderTdImage(row) {
  const MAX_LENGTH = 30;
  let image = row.image;
  let length = image.length;
  let title = "";
  if (length >= MAX_LENGTH + 5) {
    image = image.substring(0, MAX_LENGTH) + '...';
    title = row.image;
  }
  return (
    <td key="image" title={title}>{image}</td>
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
    containers: state.containers
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
    },
    {
      type: 'number',
      title: 'Error in last 24 hours',
      titles: 'Errors in last 23 hours'
    }
  ];

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
    let runningJobs = 0;
    let errorCount = 0;


    if (rows && rows.length > 0) {
      rows.forEach((container) => {
        if (container.run) {
          runningContainers++;
        }
      });
    }

    const containersHeaderBar = (
      <div className="clearfix">
        <h3>Containers</h3>

        <ButtonToolbar>
          <Button
            bsStyle="primary"
            onClick={this.createContainer.bind(this)}
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

    return (
      <div>
        <StatisticsPanel metrics={this.statisticsMetrics}
                         values={[runningContainers, runningNodes, runningJobs, errorCount]}
        />

        <h1>
          <Link to="/clusters">Clusters</Link> / {name}
        </h1>

        <Panel header={containersHeaderBar}>
          {!rows && (
            <ProgressBar active now={100} />
          )}

          {(rows && rows.length > 0) && (
            <div>
              <div className="containers">
                <DockTable columns={COLUMNS}
                           rows={rows}
                           groupBy="node"
                           groupBySelect={GROUP_BY_SELECT}
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

    /*
     <ButtonToolbar bsStyle="default">
     <SplitButton bsStyle="info"
     title="Show Log"
     onClick={this.showLog.bind(this)}>

     <MenuItem eventKey="1" onClick={this.showLog.bind(this)}>Show Log</MenuItem>
     <MenuItem divider />
     {!container.run && (
     <MenuItem eventKey="2" onClick={this.startContainer.bind(this)}>Start</MenuItem>
     )}
     {container.run && (
     <MenuItem eventKey="3" onClick={this.stopContainer.bind(this)}>Stop</MenuItem>
     )}
     {container.run && (
     <MenuItem eventKey="4" onClick={this.restartContainer.bind(this)}>Restart</MenuItem>
     )}
     <MenuItem divider />
     {container.run && (
     <MenuItem eventKey="5" onClick={this.scaleContainer.bind(this)}>Scale</MenuItem>
     )}
     <MenuItem eventKey="6" onClick={this.showDetails.bind(this)}>Details</MenuItem>
     {container.run && (
     <MenuItem eventKey="7" onClick={this.showStats.bind(this)}>Stats</MenuItem>
     )}
     <MenuItem divider />
     <MenuItem eventKey="8" onClick={this.removeContainer.bind(this)}>Delete</MenuItem>

     </SplitButton>
     </ButtonToolbar>

     */
  }

  onHideDialog() {
    this.setState({
      actionDialog: undefined
    });
  }

  onActionInvoke(action, container) {
    const {clusters, params: {name}} = this.props;
    let cluster = clusters[name];
    let currentContainer = this.props.containers[container];

    switch (action) {
      case "create":
        this.setState({
          actionDialog: (
            <ContainerCreate title="Create a New Cluster"
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

      case "delete":
        return;

      default:
        return;
    }
  }

  createContainer() {
    const {clusters, params: {name}} = this.props;
    let cluster = clusters[name];
    let contentComponent = <ContainerCreate cluster={cluster}/>;
    window.simpleModal.show({
      contentComponent,
      size: 'lg',
      focus: ContainerCreate.focusSelector
    });
  }

  showLog(event) {
    let container = this._getContainerByTarget(event.target);
    let bodyComponent = <ContainerLog container={container}/>;
    window.simpleModal.show({title: 'Logs', bodyComponent, size: 'xl'});
  }

  startContainer(event) {
    const {startContainer, loadContainers, params: {name}} = this.props;
    let container = this._getContainerByTarget(event.target);
    confirm('Are you sure you want to start container?')
      .then(() => {
        startContainer(container).catch(() => null)
          .then(() => loadContainers(name));
      })
      .catch(() => null);// confirm cancel
  }

  stopContainer(event) {
    const {stopContainer, loadContainers, params: {name}} = this.props;
    let container = this._getContainerByTarget(event.target);
    confirm('Are you sure you want to stop container?')
      .then(() => {
        stopContainer(container).catch(() => null)
          .then(() => loadContainers(name));
      })
      .catch(() => null);// confirm cancel
  }

  restartContainer(event) {
    const {restartContainer, loadContainers, params: {name}} = this.props;
    let container = this._getContainerByTarget(event.target);
    confirm('Are you sure you want to restart container?')
      .then(() => {
        restartContainer(container).catch(() => null)
          .then(() => loadContainers(name));
      })
      .catch(() => null);// confirm cancel
  }

  scaleContainer(event) {
    let container = this._getContainerByTarget(event.target);
    let contentComponent = <ContainerScale container={container}/>;
    window.simpleModal.show({
      contentComponent,
      focus: ContainerScale.focusSelector
    });
  }

  showDetails(event) {
    let container = this._getContainerByTarget(event.target);
    let bodyComponent = <ContainerDetails container={container}/>;
    window.simpleModal.show({title: 'Container Details', bodyComponent, size: 'xl'});
  }

  showStats(event) {
    let container = this._getContainerByTarget(event.target);
    let bodyComponent = <ContainerStatistics container={container}/>;
    window.simpleModal.show({title: 'Container Statistics', bodyComponent, size: 'xl'});
  }

  removeContainer(event) {
    const {removeContainer, loadContainers, params: {name}} = this.props;
    let container = this._getContainerByTarget(event.target);
    confirm('Are you sure you want to remove this container?')
      .then(() => {
        removeContainer(container).catch(() => null)
          .then(() => loadContainers(name));
      })
      .catch(() => null);// confirm cancel
  }

  deleteCluster() {
    const {params: {name}, deleteCluster} = this.props;
    confirm('Are you sure you want to remove this cluster?')
      .then(() => {
        deleteCluster(name)
          .then(() => browserHistory.push('/clusters'));
      }, () => null);
  }

  _getContainerByTarget(target) {
    const {containers} = this.props;
    let $tr = $(target).parents('tr');
    let id = $tr.data('id');
    return containers[id];
  }


}
