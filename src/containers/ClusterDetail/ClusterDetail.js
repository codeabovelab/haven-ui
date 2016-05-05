import React, {Component, PropTypes} from 'react';
import * as clusterActions from 'redux/modules/clusters/clusters';
import * as containerActions from 'redux/modules/containers/containers';
import {connect} from 'react-redux';
import { Link, browserHistory } from 'react-router';
import {ContainerLog} from '../../components/index';

@connect(
  state => ({
    clusters: state.clusters,
    containers: state.containers
  }), {
    loadContainers: clusterActions.loadContainers,
    deleteCluster: clusterActions.deleteCluster,
    startContainer: containerActions.start,
    stopContainer: containerActions.stop
  })
export default class ClusterDetail extends Component {
  static propTypes = {
    clusters: PropTypes.object,
    containers: PropTypes.object,
    params: PropTypes.object,
    loadContainers: PropTypes.func.isRequired,
    deleteCluster: PropTypes.func.isRequired,
    startContainer: PropTypes.func.isRequired,
    stopContainer: PropTypes.func.isRequired
  };

  componentDidMount() {
    const {loadContainers, params: {name}} = this.props;
    loadContainers(name);
  }

  additionalComponent = null;

  render() {
    const {containers, clusters, params: {name}, deleteCluster} = this.props;
    const cluster = clusters[name];

    if (!cluster) {
      return (
        <div></div>
      );
    }


    function handleDelete() {
      confirm('Are you sure you want to remove this cluster?')
        .then(() => {
          deleteCluster(name)
            .then(() => browserHistory.push('/clusters'));
        }, () => null);
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
            <button className="btn btn-primary" disabled><i className="fa fa-plus"/> New Container</button>
            <button className="btn btn-danger" onClick={handleDelete}><i className="fa fa-trash"/> Delete Cluster
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
                    <i className="fa fa-eye" onClick={this.showLog.bind(this)}/>
                    {!container.run &&
                    <span> | <i className="fa fa-play" onClick={this.startContainer.bind(this)}/></span>}
                    {container.run &&
                    <span> | <i className="fa fa-stop" onClick={this.stopContainer.bind(this)}/></span>}
                    {' '}| <i className="fa fa-trash" disabled/>
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

  showLog(event) {
    let container = this._getContainerByTarget(event.target);
    this.setState({additionalComponent: <ContainerLog container={container}/>});
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

  _getContainerByTarget(target) {
    const {containers} = this.props;
    let $tr = $(target).parents('tr');
    let id = $tr.data('id');
    return containers[id];
  }


}
