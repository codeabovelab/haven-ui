import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Field, reduxForm, SubmissionError} from 'redux-form';
import {load, create, loadNodes} from 'redux/modules/clusters/clusters';
import {create as createNode} from 'redux/modules/nodes/nodes';
import {createValidator, required} from 'utils/validation';
import {Dialog} from 'components';
import {FormGroup, FormControl, ControlLabel, HelpBlock, Alert} from 'react-bootstrap';

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
export default class ClusterAdd extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    create: PropTypes.func.isRequired,
    createNode: PropTypes.func.isRequired,
    load: PropTypes.func.isRequired,
    loadNodes: PropTypes.func.isRequired,
    fields: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func,
    orphanNodes: PropTypes.array,
    resetForm: PropTypes.func,
    submitting: PropTypes.bool,
    createError: PropTypes.string,
    valid: PropTypes.bool.isRequired,
    cluster: PropTypes.any,
    description: PropTypes.any,
    onHide: PropTypes.func.isRequired
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
    const { fields } = this.props;
    return this.props.create(fields.name.value, {"description": fields.description.value}).then(() => {
      if (typeof(fields.assignedNodes.value) !== 'undefined' && fields.assignedNodes.value.length > 0) {
        fields.assignedNodes.value.map(function createNode(node) {
          if (typeof(node) !== 'undefined') {
            let data = {name: node, cluster: fields.name.value};
            this.props.createNode(data);
          }
        }.bind(this));
      }
    }).then(() =>{
      window.setTimeout(this.props.load(), 2000);
      this.props.loadNodes('orphans');
    }).then(() =>{
      this.props.onHide();
    })
    .catch((response) => {
      throw new SubmissionError(response.message);
    });
  }

  render() {
    const { fields } = this.props;
    let { cluster, description } = this.props;
    const orphanNodes = this.props.orphanNodes;
    return (
      <Dialog show
              size="large"
              title={this.props.title}
              submitting={this.props.submitting}
              allowSubmit={this.props.valid}
              onReset={this.props.resetForm}
              onSubmit={this.props.handleSubmit(this.onSubmit.bind(this))}
              onHide={this.props.onHide}
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
                         defaultValue = {cluster === 'undefined' ? '' : cluster}
            />
          </FormGroup>

          <FormGroup validationState={fields.description.error ? "error" : ""}>
            <ControlLabel>Description</ControlLabel>

            <FormControl type="text"
                         {...fields.description}
                         placeholder="Description"
                         defaultValue = {description === 'undefined' ? '' : description}
            />

            <FormControl.Feedback />

            {fields.description.error && (
              <HelpBlock>{fields.description.error}</HelpBlock>
            )}
          </FormGroup>
          <FormGroup className={typeof(this.props.cluster) === 'undefined' ? '' : 'invisible'}
                     validationState={fields.assignedNodes.error ? "error" : ""}>
            <ControlLabel>Assigned Nodes</ControlLabel>
            <FormControl multiple componentClass="select" {...fields.assignedNodes} >
              {
                orphanNodes.map(function listNodes(node, i) {
                  if (typeof(node) !== 'undefined' && node.trim() !== '') {
                    return <option key={i} value={node}>{node}</option>;
                  }
                })
              }
            </FormControl>
            <FormControl.Feedback />
            {fields.assignedNodes.error && (
              <HelpBlock>{fields.assignedNodes.error}</HelpBlock>
            )}
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
