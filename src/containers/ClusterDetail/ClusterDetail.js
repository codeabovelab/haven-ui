import React, {Component, PropTypes} from 'react';
import * as clusterActions from 'redux/modules/clusterDetail';
import {connect} from 'react-redux';
//import { asyncConnect } from 'redux-async-connect';
import { Link, browserHistory } from 'react-router';

@connect(
  state => ({
    containers: state.clusterDetail.data,
    loadingContainers: state.clusterDetail.loadingContainers,
    loadedContainers: state.clusterDetail.loadedContainers
  }),
  clusterActions)
export default class ClusterDetail extends Component {
  static propTypes = {
    containers: PropTypes.array,
    params: PropTypes.object,
    loadContainers: PropTypes.func.isRequired,
    deleteCluster: PropTypes.func.isRequired,
    loadingContainers: PropTypes.bool,
    loadedContainers: PropTypes.bool
  };

  componentDidMount() {
    const {loadContainers, params: {name}} = this.props; // eslint-disable-line no-shadow
    loadContainers(name);
  }


  render() {
    const {containers, params: {name}, deleteCluster} = this.props; // eslint-disable-line no-shadow

    function handleDelete() {
      if (confirm('Are you sure you want to remove this cluster?')) {
        deleteCluster(name)
          .then(() => browserHistory.push('/clusters'));
      }
    }


    return (
      <div className="container-fluid">
        <h1>
          <Link to="/clusters">Clusters</Link> / {name}
        </h1>
        <div className="page-info-group">
          # of Containers: <strong>{containers && containers.length}</strong>
        </div>
        <div className="page-actions">
          <div className="btn-group">
            <button className="btn btn-primary" disabled><i className="fa fa-plus"></i> New Container</button>
            <button className="btn btn-danger" onClick={handleDelete}><i className="fa fa-trash"></i> Delete Cluster
            </button>
          </div>
        </div>
        <div className="clearfix"></div>
        {containers && containers.length > 0 &&
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
              {containers.map(container =>
                <tr key={container.name}>
                  <td>{container.name}</td>
                  <td>{container.image}</td>
                  <td>{container.node}</td>
                  <td>{container.ports}</td>
                  <td>{container.status}</td>
                  <td></td>
                </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>
        }
        {containers && containers.length === 0 &&
        <div className="alert alert-info">
          No containers yet
        </div>}
      </div>
    );
  }
}
