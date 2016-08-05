import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {reduxForm} from 'redux-form';
import {load, create} from 'redux/modules/clusters/clusters';
import clusterValidation from './clusterValidation';
import {Dialog} from 'components';
import {FormGroup, FormControl, ControlLabel, Label, Badge, ButtonToolbar, SplitButton, MenuItem, Panel, Button, ProgressBar} from 'react-bootstrap';
import _ from 'lodash';

@connect(state => ({
  createError: state.clustersUI.createError
}), {create, load})
@reduxForm({
  form: 'ClusterAdd',
  fields: [
    'name',
    'description'
  ],
  validate: clusterValidation,
})
export default class ClusterAdd extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    create: PropTypes.func.isRequired,
    load: PropTypes.func.isRequired,
    fields: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func,
    resetForm: PropTypes.func,
    submitting: PropTypes.bool,
    createError: PropTypes.string,
    valid: PropTypes.bool.isRequired,
    cluster: PropTypes.any,
    onHide: PropTypes.func.isRequired
  };

  static focusSelector = '[name=name]';

  render() {
    const { fields } = this.props;

    return (
      <Dialog show
              size="large"
              title={this.props.title}
              submitting={this.props.submitting}
              allowSubmit={this.props.valid}
              onReset={this.props.resetForm}
              onSubmit={this.props.handleSubmit}
              onHide={this.props.onHide}
      >
        <form>
          <FormGroup>
            <ControlLabel>Name</ControlLabel>

            <FormControl type="text"
                         {...fields.name}
            />

            <FormControl.Feedback />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Description</ControlLabel>

            <FormControl type="text"
                         {...fields.description}
            />

            <FormControl.Feedback />
          </FormGroup>
        </form>
      </Dialog>
    );
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
