import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Field, reduxForm, SubmissionError} from 'redux-form';
import {load, create, loadNodes} from 'redux/modules/clusters/clusters';
import {create as createNode} from 'redux/modules/nodes/nodes';
import {createValidator, required} from 'utils/validation';
import {Dialog} from 'components';
import {FormGroup, FormControl, ControlLabel, HelpBlock, Alert} from 'react-bootstrap';
import _ from 'lodash';

@connect(state => ({
  createError: state.clustersUI.createError
}), {create, load, createNode, loadNodes})
@reduxForm({
  form: 'ClusterAdd',
  fields: [
    'name',
    'description',
    'assignedNodes'
  ],
  validate: createValidator({
    name: [required]
  })
})
export default class UserAdd extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    fields: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func,
    resetForm: PropTypes.func,
    submitting: PropTypes.bool,
    createError: PropTypes.string,
    valid: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    okTitle: PropTypes.string
  };
  constructor() {
    super();
    this.state = {
      firstLoad: true
    };
  }
  onSubmit() {
    this.setState({
      firstLoad: false
    });
  }

  render() {
    const { fields, okTitle } = this.props;
    return (
      <Dialog show
              size="large"
              title={this.props.title}
              submitting={this.props.submitting}
              allowSubmit={this.props.valid}
              onReset={this.props.resetForm}
              onSubmit={this.props.handleSubmit(this.onSubmit.bind(this))}
              onHide={this.props.onHide}
              okTitle={okTitle || 'OK'}
      >
        {this.props.createError && (
          <Alert bsStyle="danger">
            {this.props.createError}
          </Alert>
        )}

        <form onSubmit={this.props.handleSubmit(this.onSubmit.bind(this))}>
          <FormGroup title="required" required validationState={(fields.name.error && (!this.state.firstLoad || fields.name.touched)) ? "error" : ""}>
            <ControlLabel>Name</ControlLabel>
            <FormControl type="text"
                         {...fields.name}
                         placeholder="Name (required)"
                         disabled = {okTitle === 'Update Cluster'}
            />
          </FormGroup>

          <FormGroup validationState={fields.description.error ? "error" : ""}>
            <ControlLabel>Description</ControlLabel>

            <FormControl type="text"
                         {...fields.description}
                         placeholder="Description"
            />

            <FormControl.Feedback />

            {fields.description.error && (
              <HelpBlock>{fields.description.error}</HelpBlock>
            )}
          </FormGroup>
        </form>
        <div ref="error" className="text-danger text-xs-center text-error">
        </div>
      </Dialog>
    );
  }

  // addUser() {
  //   const {create, load, fields, resetForm} = this.props;
  //
  //   return create({name: fields.name.value})
  //     .then(() => {
  //       resetForm();
  //       load();
  //       window.simpleModal.close();
  //     })
  //     .catch();
  // }
}
