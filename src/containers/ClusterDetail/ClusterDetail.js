import React, {Component, PropTypes} from 'react';
import * as clusterActions from 'redux/modules/clusters/clusters';
import * as containerActions from 'redux/modules/containers/containers';
import {connect} from 'react-redux';
import { Link, browserHistory } from 'react-router';
import {ContainerLog} from '../../components/index';
import {ContainerCreate} from '../../containers/index';

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

  additionalComponent = null;

  render() {
    const {containers, clusters, params: {name}} = this.props;
    const cluster = clusters[name];

    if (!cluster) {
      return (
        <div></div>
      );
    }


    const containersIds = cluster.containersList;
    const containersList = containersIds == null ? null : containersIds.map(id => containers[id]);

    return (
      <div className="container-fluid">
        <h1>
          <Link to="/clusters">Clusters</Link> / {name}
        </h1>
        <div className="page-info-group">
          {cluster.environment &&
          <div>
            <label>Env:</label>
            <value>{cluster.environment}</value>
          </div>
          }
          <div>
            <label># of Containers:</label>
            <value>{containersList && containersList.length}</value>
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
        {containersList && containersList.length > 0 &&
        <div>
          <h2>Containers</h2>
          <div className="table-responsive">
            <table className="table table-striped table-sm">
              <thead>
              <tr>
                <th>Name</th>
                <th>Image Name</th>
                <th>Node Name</th>
                <th>Port Mapping</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
              </thead>
              <tbody>
              {containersList.map(container =>
                <tr key={container.name} data-id={container.id}>
                  <td>{container.name}</td>
                  <td>{container.image}</td>
                  <td>{container.node}</td>
                  <td>{container.ports}</td>
                  <td>{container.status}</td>
                  <td className="td-actions">
                    <i className="fa fa-eye" data-toggle="tooltip" data-placement="top" title="Show Logs"
                       onClick={this.showLog.bind(this)}/>
                    {!container.run &&
                    <span> | <i className="fa fa-play" data-toggle="tooltip" title="Start"
                                onClick={this.startContainer.bind(this)}/></span>}
                    {container.run &&
                    <span> | <i className="fa fa-stop" title="Stop" onClick={this.stopContainer.bind(this)}/></span>}
                    {container.run &&
                    <span> | <i className="fa fa-refresh" title="Restart"
                                onClick={this.restartContainer.bind(this)}/></span>}
                    <span> | <i className="fa fa-trash" title="Remove"
                                onClick={this.removeContainer.bind(this)}/></span>
                  </td>
                </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>
        }
        {containersList && containersList.length === 0 &&
        <div className="alert alert-info">
          No containers yet
        </div>}
        {this.state && this.state.additionalComponent}
      </div>
    );
  }

  createContainer(event) {
    const {clusters, params: {name}} = this.props;
    let cluster = clusters[name];
    let contentComponent = <ContainerCreate cluster={cluster}/>;
    window.simpleModal({title: 'Create Container', contentComponent, size: 'lg'});
  }

  showLog(event) {
    let container = this._getContainerByTarget(event.target);
    let bodyComponent = <ContainerLog container={container}/>;
    window.simpleModal({title: 'Logs', bodyComponent, size: 'xl'});
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

  _getContainerByTarget(target) {
    const {containers} = this.props;
    let $tr = $(target).parents('tr');
    let id = $tr.data('id');
    return containers[id];
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
