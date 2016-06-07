import React, {Component, PropTypes} from 'react';
import {load, create} from 'redux/modules/nodes/nodes';
import {removeCreateError} from 'redux/modules/nodes/nodesUI';
import {load as loadClusters} from 'redux/modules/clusters/clusters';
import {connect} from 'react-redux';
import { asyncConnect } from 'redux-async-connect';
import { Link } from 'react-router';
import {bindActionCreators} from 'redux';
import {reduxForm} from 'redux-form';
import nodeValidation from './nodeValidation';

@connect(
  state => ({
    nodes: state.nodes,
    nodesIds: state.nodesUI.list,
    createError: state.nodesUI.createError,
    clusters: state.clusters,
    clustersIds: state.clustersUI.list
  }), dispatch => bindActionCreators({load, create, loadClusters, removeCreateError}, dispatch))
@reduxForm({
  form: 'newNode',
  fields: ['cluster', 'name'],
  validate: nodeValidation
})
export default class NodesList extends Component {
  static propTypes = {
    nodes: PropTypes.object,
    nodesIds: PropTypes.array,
    load: PropTypes.func.isRequired,
    create: PropTypes.func.isRequired,
    createError: PropTypes.string,
    clusters: PropTypes.object,
    clustersIds: PropTypes.array,
    loadClusters: PropTypes.func.isRequired,
    removeCreateError: PropTypes.func.isRequired,
    fields: PropTypes.object.isRequired,
    resetForm: PropTypes.func.isRequired,
    valid: PropTypes.bool.isRequired
  };

  componentDidMount() {
    const {load} = this.props;
    load();
  }

  render() {
    let self = this;
    const {fields, valid, resetForm, create, createError, nodes, nodesIds} = this.props;
    const nodesList = nodesIds !== null ? nodesIds.map(id => nodes[id]) : null;
    const {clusters, clustersIds, loadClusters} = this.props;
    const clustersList = clustersIds !== null ? clustersIds.map(id => clusters[id]) : null;

    function showModal() {
      const {removeCreateError} = self.props;
      if (clustersIds === null) {
        loadClusters();
      }
      if (createError) {
        removeCreateError();
      }
      $('#newNode').modal('show');
      $('#input-name').focus();
    }

    function handleCreate() {
      let cluster = fields.cluster.value;
      let name = fields.name.value;
      let clusterId = clusters[cluster].getId();
      create({cluster: clusterId, name})
        .then(() => {
          resetForm();
          $('#newNode').modal('hide');
          return load();
        })
        .catch();
    }

    let field;
    return (
      <div className="container-fluid">
        <div>
          <h1>Node List</h1>
          <div className="page-info-group">
            <div>
              <label>
                # of Nodes:
              </label>
              <value>
                {nodesList && nodesList.length}
              </value>
            </div>
          </div>
          <div className="page-actions">
            <button className="btn btn-primary" onClick={showModal}><i className="fa fa-plus"/> Add Node</button>
          </div>
          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead>
              <tr>
                <th>Node Name</th>
                <th>Internal IP</th>
                <th># of Containers</th>
                <th>Health</th>
                <th># of CPU</th>
                <th>Memory Usage</th>
                <th>Assigned cluster</th>
                <th>Actions</th>
              </tr>
              </thead>
              <tbody>
              {nodesList && nodesList.map(node =>
                <tr key={node.name}>
                  <td>{node.name}</td>
                  <td>{node.ip}</td>
                  <td>{node.containers && node.containers.length}</td>
                  <td/>
                  <td/>
                  <td/>
                  <td/>
                  <td className="td-actions">
                    <i className="fa fa-pencil" disabled/> | <i className="fa fa-trash" disabled/>
                  </td>
                </tr>)}
              </tbody>
            </table>
          </div>
        </div>
        <div id="newNode" className="modal">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
                <h4 className="modal-title">Create New Node</h4>
              </div>
              <div className="modal-body">
                <form>
                  <div className="form-group" required>
                    {(field = fields.name) && ''}
                    <label>Node name:</label>
                    {field.error && field.touched && <div className="text-danger">{field.error}</div>}
                    <input type="text" id="input-name" {...field} className="form-control"/>
                  </div>
                  <div className="form-group" required>
                    <label>Cluster:</label>
                    {(field = fields.cluster) && ''}
                    {field.error && field.touched && <div className="text-danger">{field.error}</div>}
                    <select className="form-control" {...field}>
                      <option disabled/>
                      {clustersList && clustersList.map(cluster =>
                        <option key={cluster.name} value={cluster.name}>{cluster.name}</option>
                      )}
                    </select>
                  </div>
                  <div className="text-danger">{createError}</div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                <button type="button" className="btn btn-primary" onClick={handleCreate} disabled={!valid}>Create New
                  Node
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
