import React, {Component, PropTypes} from 'react';
import {load, create} from 'redux/modules/clusters/clusters';
import {connect} from 'react-redux';
import { Link } from 'react-router';
import {bindActionCreators} from 'redux';
import {reduxForm} from 'redux-form';
import clusterValidation from './clusterValidation';


@connect(
  state => ({
    clusters: state.clusters,
    clustersIds: state.clustersUI.list,
    createError: state.clustersUI.createError
  }), dispatch => bindActionCreators({create, load}, dispatch))
@reduxForm({
  form: 'newCluster',
  validate: clusterValidation,
  fields: ['env', 'name']
})
export default class ClusterList extends Component {
  static propTypes = {
    clusters: PropTypes.object,
    clustersIds: PropTypes.array,
    createError: PropTypes.string,
    create: PropTypes.func.isRequired,
    load: PropTypes.func.isRequired,
    fields: PropTypes.object.isRequired,
    resetForm: PropTypes.func.isRequired,
    valid: PropTypes.bool.isRequired
  };

  componentDidMount() {
    const {load} = this.props;
    load();
  }

  render() {
    const {fields, valid, resetForm, clusters, clustersIds, create, createError, load} = this.props;
    const clustersList = clustersIds !== null ? clustersIds.map(id => clusters[id]) : null;

    function handleCreate() {
      let name = fields.name.value;
      let env = fields.env.value;
      create({name, env})
        .then(() => {
          resetForm();
          fields.name.value = '';
          fields.env.value = '';
          $('#newCluster').modal('hide');
          return load();
        })
        .catch();
    }

    function showModal() {
      $('#newCluster').modal('show');
      $('#input-env').focus();
    }

    let field;
    return (
      <div className="container-fluid">
        <h1>Cluster List</h1>
        <div className="page-info-group">
          <div>
            <label># of Clusters:</label>
            <value>{clustersList && clustersList.length}</value>
          </div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={showModal}><i className="fa fa-plus"/> New Cluster
          </button>
        </div>
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead>
            <tr>
              <th>Cluster Name</th>
              <th>Environment</th>
              <th># of Containers</th>
              <th># of Nodes</th>
            </tr>
            </thead>
            <tbody>
            {clustersList && clustersList.map(cluster =>
              <tr key={cluster.name}>
                <td>
                  <Link to={"/clusters/" + cluster.name}>{cluster.name}</Link>
                </td>
                <td>{cluster.environment}</td>
                <td>{cluster.containers}</td>
                <td>{cluster.nodes}</td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <div id="newCluster" className="modal">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
                <h4 className="modal-title">Create New Cluster</h4>
              </div>
              <div className="modal-body">
                <form>
                  <div className="form-group" required>
                    <label>Environment:</label>
                    {(field = fields.env) && ''}
                    {field.error && field.touched && <div className="text-danger">{field.error}</div>}
                    <input id="input-env" type="text" {...fields.env} className="form-control"/>
                  </div>
                  <div className="form-group" required>
                    {(field = fields.name) && ''}
                    <label>Cluster name:</label>
                    {field.error && field.touched && <div className="text-danger">{field.error}</div>}
                    <input type="text" {...fields.name} className="form-control"/>
                  </div>
                  <div className="text-danger">{createError}</div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                <button type="button" className="btn btn-primary" onClick={handleCreate} disabled={!valid}>Create New
                  Cluster
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
