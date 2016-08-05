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
export default class ClusterAdd extends Component {
  static propTypes = {
    create: PropTypes.func.isRequired,
    load: PropTypes.func.isRequired,
    fields: PropTypes.object.isRequired,
    resetForm: PropTypes.func.isRequired,
    createError: PropTypes.string,
    valid: PropTypes.bool.isRequired,
    cluster: PropTypes.object
  };

  static focusSelector = '[name=name]';

  render() {
    const {fields, valid, cluster} = this.props;
    let creating = false;
    console.log('cluster', cluster);

    return (
      <form>
        {fieldComponent()}

        <button type="button" className="btn btn-primary" onClick={this.addCluster.bind(this)}
                disabled={creating || !valid}>
          <i className="fa fa-plus"/> Add
        </button>
      </form>
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

  addCluster() {
    const {create, load, fields, resetForm} = this.props;

    return create({name: fields.name.value})
      .then(() => {
        resetForm();
        load();
        window.simpleModal.close();
      })
      .catch();
  }
}
