import React, {Component, PropTypes} from 'react';
import {isLoaded, load as loadClusterList} from 'redux/modules/clusterList';
import {connect} from 'react-redux';
import { asyncConnect } from 'redux-async-connect';

@asyncConnect([{
  deferred: true,
  promise: ({store: {dispatch, getState}}) => {
    if (!isLoaded(getState())) {
      return dispatch(loadClusterList());
    }
  }
}])
@connect(
  state => ({
    clusterList: state.clusterList.data,
    error: state.clusterList.error,
    loading: state.clusterList.loading
  }))
export default class ClusterList extends Component {
  static propTypes = {
    clusterList: PropTypes.array,
    error: PropTypes.string,
    loading: PropTypes.bool,
  }

  render() {
    const {clusterList} = this.props; // eslint-disable-line no-shadow
    return (
      <div>
        <h1>Cluster List</h1>
        <div className="text-center">
          Clusters total: <strong>{clusterList && clusterList.length}</strong>
        </div>
        <div className="pull-right">
          <button className="btn btn-primary">Create New Cluster</button>
        </div>
        <table className="table">
          <thead>
          <tr>
            <th>Cluster Name</th>
            <th># of Containers</th>
            <th># of Nodes</th>
            <th>Deployable Image Tag</th>
          </tr>
          {clusterList && clusterList.map(cluster =>
            <tr key={String(cluster.name)}>
              <td>{String(cluster.name)}</td>
              <td></td>
              <td></td>
              <td></td>
            </tr>)}
          </thead>
          <tbody>
          <tr>
          </tr>
          </tbody>
        </table>
      </div>
    );
  }
}
