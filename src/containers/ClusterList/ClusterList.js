import React, {Component, PropTypes} from 'react';
import {isLoaded, load, create} from 'redux/modules/clusterList';
import {connect} from 'react-redux';
import { asyncConnect } from 'redux-async-connect';
import { Link } from 'react-router';
import {bindActionCreators} from 'redux';

@connect(
  state => ({
    clusterList: state.clusterList.data,
    error: state.clusterList.error,
    loading: state.clusterList.loading
  }), dispatch => bindActionCreators({create, load}, dispatch))
export default class ClusterList extends Component {
  static propTypes = {
    clusterList: PropTypes.array,
    error: PropTypes.string,
    loading: PropTypes.bool,
    create: PropTypes.func.isRequired,
    load: PropTypes.func.isRequired
  };

  componentDidMount() {
    const {load} = this.props; // eslint-disable-line no-shadow
    load();
  }

  render() {
    const s = require('./ClusterList.scss');
    const {clusterList, create, load} = this.props; // eslint-disable-line no-shadow

    function handleCreate() {
      const name = prompt("Name of new cluster");
      if (name) {
        create(name)
          .then(() => load());
      }
    }

    return (
      <div className="container-fluid">
        <div className={s.clusterList}>
          <h1>Cluster List</h1>
          <div className="page-info-group">
            # of Clusters: <strong>{clusterList && clusterList.length}</strong>
          </div>
          <div className="page-actions">
            <button className="btn btn-primary" onClick={handleCreate}><i className="fa fa-plus"></i> New Cluster
            </button>
          </div>
          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead>
              <tr>
                <th>Cluster Name</th>
                <th># of Containers</th>
                <th># of Nodes</th>
              </tr>
              {clusterList && clusterList.map(cluster =>
                <tr key={String(cluster.name)}>
                  <td>
                    <Link to={"/cluster/" + cluster.name}>{String(cluster.name)}</Link>
                  </td>
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
        </div>
      </div>
    );
  }
}
