import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {reduxForm} from 'redux-form';
import {create, load} from 'redux/modules/nodes/nodes';
import {load as loadClusters} from 'redux/modules/clusters/clusters';
import nodeValidation from './nodeValidation';
import {removeCreateError} from 'redux/modules/nodes/nodesUI';
import _ from 'lodash';

@connect(state => ({
  createError: state.clustersUI.createError,
  clusters: state.clusters,
  clustersIds: state.clustersUI.list
}), {create, load, loadClusters, removeCreateError})
@reduxForm({
  form: 'nodeAdd',
  validate: nodeValidation,
  fields: ['cluster', 'name']
})
export default class NodeAdd extends Component {
  static propTypes = {
    create: PropTypes.func.isRequired,
    load: PropTypes.func.isRequired,
    loadClusters: PropTypes.func.isRequired,
    createError: PropTypes.string,
    removeCreateError: PropTypes.func.isRequired,
    clusters: PropTypes.object,
    clustersIds: PropTypes.array,
    fields: PropTypes.object.isRequired,
    resetForm: PropTypes.func.isRequired,
    valid: PropTypes.bool.isRequired
  };

  static focusSelector = '[name=name]';

  componentWillMount() {
    const {clustersIds, loadClusters, removeCreateError} = this.props;
    if (!clustersIds) {
      loadClusters();
    }
    removeCreateError();
  }

  render() {
    const {fields, valid, createError} = this.props;
    let creating = false;
    const {clusters, clustersIds} = this.props;
    const clustersList = clustersIds !== null ? clustersIds.map(id => clusters[id]) : null;
    let field;

    return (
      <div className="modal-content">
        <div className="modal-header">
          <button type="button" className="close" data-dismiss="modal">
            <span aria-hidden="true">&times;</span>
          </button>
          <h4 className="modal-title">Add Node
            {creating && <span>{' '}<i className="fa fa-spinner fa fa-pulse"/></span>}
          </h4>
        </div>
        <div className="modal-body">
          <form>
            {fieldComponent()}
            <div className="form-group" required>
              <label>Cluster:</label>
              {(field = fields.cluster) && ''}
              {field.error && field.value && field.touched && <div className="text-danger">{field.error}</div>}
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
          <button type="button" className="btn btn-primary" onClick={this.addNode.bind(this)}
                  disabled={creating || !valid}>
            <i className="fa fa-plus"/> Add
          </button>
        </div>
      </div>
    );

    function fieldComponent() {
      let field = fields.name;
      return (<div className="form-group" required>
        <label>Name</label>
        {field.error && field.touched && field.value && <div className="text-danger">{field.error}</div>}
        {inputText(field)}
      </div>);
    }


    function inputText(field) {
      return <input type="text" {...field} className="form-control"/>;
    }
  }

  addNode() {
    const {create, load, fields, resetForm, clusters} = this.props;
    let cluster = fields.cluster.value;
    let clusterId = clusters[cluster].getId();
    let data = {name: fields.name.value, cluster: clusterId};

    return create(data)
      .then(() => {
        resetForm();
        load();
        window.simpleModal.close();
      })
      .catch();
  }
}
