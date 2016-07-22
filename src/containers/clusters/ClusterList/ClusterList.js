import React, {Component, PropTypes} from 'react';
import {load} from 'redux/modules/clusters/clusters';
import {connect} from 'react-redux';
import { Link } from 'react-router';
import {DockTable} from '../../../components/index';
import {ClusterAdd} from '../../index';
import {Label, Badge, ButtonToolbar, SplitButton, MenuItem} from 'react-bootstrap';

const COLUMNS = [
  {
    name: 'name',
    label: 'Cluster Name',
    sortable: true,
    render: nameRender
  },
  {
    name: 'features',
    label: 'Features',
    render: featuresRender
  },
  {
    name: 'containers',
    label: '# of Containers',
    width: '15%',
    render: containersRender
  },
  {
    name: 'nodes',
    label: '# of Nodes',
    width: '15%',
    render: nodesRender
  },
  {
    name: 'Actions',
    width: '10%',
    render: actionsRender
  }
];

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
              <button className="btn btn-primary"
                      onClick={this.createCluster.bind(this)}>
                <i className="fa fa-plus" />
                New Cluster
              </button>
            </div>

            <div className="clearfix"></div>

            {clustersList && (
              <DockTable columns={COLUMNS}
                         rows={clustersList}
              />
            )}
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

function featuresRender(cluster) {
  return (
    <td key="features">
      {cluster.features.map((feature) => {
        return (
          <Label bsStyle="info">{feature}</Label>
        );
      })}
    </td>
  );
}

function containersRender(cluster) {
  return (
    <td key="containers">
      <p>
        <Label bsStyle="success">On</Label>
        &nbsp;-&nbsp;
        <strong>{cluster.containers.on}</strong>
      </p>

      <p>
        <Label bsStyle="default">Off</Label>
        &nbsp;-&nbsp;
        <strong>{cluster.containers.off}</strong>
      </p>
    </td>
  );
}

function nodesRender(cluster) {
  return (
    <td key="nodes">
      <p>
        <Label bsStyle="success">On</Label>
        &nbsp;-&nbsp;
        <strong>{cluster.nodes.on}</strong>
      </p>

      <p>
        <Label bsStyle="default">Off</Label>
        &nbsp;-&nbsp;
        <strong>{cluster.nodes.off}</strong>
      </p>
    </td>
  );
}

function actionsRender() {
  return (
    <td key="actions" className="td-actions">
      <ButtonToolbar bsStyle="default">
        <SplitButton bsStyle="info"
                     title="Edit">

          <MenuItem eventKey="1">Edit</MenuItem>
          <MenuItem divider />
          <MenuItem eventKey="2">Information</MenuItem>
          <MenuItem eventKey="3">Config</MenuItem>
          <MenuItem divider />
          <MenuItem eventKey="4">Containers</MenuItem>
          <MenuItem eventKey="5">Nodes</MenuItem>
          <MenuItem eventKey="6">Registries</MenuItem>
          <MenuItem divider />
          <MenuItem eventKey="7">Delete</MenuItem>

        </SplitButton>
      </ButtonToolbar>
    </td>
  );
}
