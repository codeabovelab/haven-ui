import React, {Component, PropTypes} from 'react';
import * as clusterActions from 'redux/modules/clusters/clusters';
import * as containerActions from 'redux/modules/containers/containers';
import {connect} from 'react-redux';
import { Link, browserHistory } from 'react-router';
import {ContainerLog, ContainerDetails, ContainerStatistics, DockTable} from '../../components/index';
import {ContainerCreate, ContainerScale} from '../../containers/index';
import { asyncConnect } from 'redux-async-connect';


const COLUMNS = [{name: 'name'}, {name: 'image', render: renderTdImage},
  {name: 'node'}, {name: 'ports', label: 'Ports Mapping'}, {name: 'status'}, {name: 'actions'}];
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
export default class ClusterDetail extends Component {
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

  componentDidMount() {
    const {loadContainers, params: {name}} = this.props;
    loadContainers(name);
  }

  render() {
    let s = require('./ClusterDetail.scss');
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

    return (
      <div className={"container-fluid " + s.clusterDetail}>
        <h1>
          <Link to="/clusters">Clusters</Link> / {name}
        </h1>
        <div className="page-info-group">
          <div>
            <label># of Containers:</label>
            <value>{rows && rows.length}</value>
          </div>
        </div>
        <div className="page-actions">
          <div className="btn-group">
            <button className="btn btn-primary" onClick={this.createContainer.bind(this)}><i className="fa fa-plus"/>
              {' '}New Container
            </button>
            <button className="btn btn-danger" onClick={this.deleteCluster.bind(this)}><i className="fa fa-trash"/>
              {' '}Delete Cluster
            </button>
          </div>
        </div>
        <div className="clearfix"></div>
        {rows && rows.length > 0 &&
        <div>
          <div className="containers">
            <DockTable columns={COLUMNS} rows={rows} title="Containers" groupBy="node"
                       groupBySelect={GROUP_BY_SELECT}/>
          </div>
        </div>
        }
        {rows && rows.length === 0 &&
        <div className="alert alert-info">
          No containers yet
        </div>}
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

  tdActions(row) {
    return (
      <td className="td-actions" key="actions">
        <i className="fa fa-eye" data-toggle="tooltip" data-placement="top" title="Show Logs"
           onClick={this.showLog.bind(this)}/>
        {!row.run &&
        <span> | <i className="fa fa-play" data-toggle="tooltip" title="Start"
                    onClick={this.startContainer.bind(this)}/></span>}
        {row.run &&
        <span> | <i className="fa fa-stop" title="Stop" onClick={this.stopContainer.bind(this)}/></span>}
        {row.run &&
        <span> | <i className="fa fa-refresh" title="Restart"
                    onClick={this.restartContainer.bind(this)}/></span>}
        {row.run &&
        <span> | <i className="fa fa-plus-circle" title="Scale"
                    onClick={this.scaleContainer.bind(this)}/></span>}
                    <span> | <i className="fa fa-info" title="Details"
                                onClick={this.showDetails.bind(this)}/></span>
        {row.run &&
        <span> | <i className="fa fa-bar-chart" title="Stats"
                    onClick={this.showStats.bind(this)}/></span>}
                    <span> | <i className="fa fa-trash" title="Remove"
                                onClick={this.removeContainer.bind(this)}/></span>
      </td>);
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
    confirm('Are you sure you want to remove container?')
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
