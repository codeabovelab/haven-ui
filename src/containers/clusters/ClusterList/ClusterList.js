import React, {Component, PropTypes} from 'react';
import {load} from 'redux/modules/clusters/clusters';
import {connect} from 'react-redux';
import { Link } from 'react-router';
import {DockTable} from '../../../components/index';
import {ClusterAdd} from '../../index';

const COLUMNS = [
  {name: 'name', label: 'Cluster Name', render: nameRender},
  {name: 'containers', label: '# of Containers'},
  {name: 'nodes', label: '# of Nodes'}];
COLUMNS.forEach(column => column.sortable = column.name !== 'actions');

@connect(
  state => ({
    clusters: state.clusters,
    clustersIds: state.clustersUI.list
  }), {load})
export default class ClusterList extends Component {
  static propTypes = {
    clusters: PropTypes.object,
    clustersIds: PropTypes.array,
    load: PropTypes.func.isRequired
  };

  componentDidMount() {
    const {load} = this.props;
    load();
    $('.input-search').focus();
  }

  render() {
    const {clusters, clustersIds} = this.props;
    const clustersList = clustersIds !== null ? clustersIds.map(id => clusters[id]) : null;

    return (
      <div className="panel">
        <div className="panel-body">
          <div className="panel-content">
            <div className="page-info-group">
              <div>
                <label># of Clusters:</label>
                <value>{clustersList && clustersList.length}</value>
              </div>
            </div>
            <div className="page-actions">
              <button className="btn btn-primary" onClick={this.createCluster.bind(this)}><i className="fa fa-plus"/> New
                Cluster
              </button>
            </div>
            <div className="clearfix"></div>
            {clustersList &&
            <DockTable columns={COLUMNS} rows={clustersList}/>}
          </div>
        </div>
      </div>
    );
  }

  createCluster() {
    let contentComponent = <ClusterAdd/>;
    window.simpleModal.show({
      contentComponent,
      focus: ClusterAdd.focusSelector
    });
  }
}

function nameRender(cluster) {
  return (
    <td key="name">
      <Link to={'/clusters/' + cluster.name}>{cluster.name}</Link>
    </td>
  );
}

