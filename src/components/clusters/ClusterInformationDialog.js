import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {reduxForm} from 'redux-form';
import {load, create} from 'redux/modules/clusters/clusters';
import clusterValidation from './clusterValidation';
import _ from 'lodash';

@connect(state => ({
  createError: state.clustersUI.createError
}), {create, load})
@reduxForm({
  form: 'clusterAdd',
  validate: clusterValidation,
  fields: ['name']
})
export default class ClusterInformationDialog extends Component {
  static propTypes = {
    create: PropTypes.func.isRequired,
    load: PropTypes.func.isRequired,
    fields: PropTypes.object.isRequired,
    resetForm: PropTypes.func.isRequired,
    createError: PropTypes.string,
    valid: PropTypes.bool.isRequired
  };

  static focusSelector = '[name=name]';

  render() {
    const {fields, valid} = this.props;
    let creating = false;

    return (
      <div className="modal-content">
        <div className="modal-header">
          <button type="button" className="close" data-dismiss="modal">
            <span aria-hidden="true">&times;</span>
          </button>
          <h4 className="modal-title">New Cluster
            {creating && <span>{' '}<i className="fa fa-spinner fa fa-pulse"/></span>}
          </h4>
        </div>
        <div className="modal-body">
          <form>
            {fieldComponent()}
          </form>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={this.addCluster.bind(this)}
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
}
