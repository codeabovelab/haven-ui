import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Field, reduxForm, SubmissionError} from 'redux-form';
import {load, create, loadNodes, loadClusterRegistries} from 'redux/modules/clusters/clusters';
import {create as createNode} from 'redux/modules/nodes/nodes';
import {createValidator, required} from 'utils/validation';
import {Dialog} from 'components';
import {load as loadRegistries} from 'redux/modules/registries/registries';
import Select from 'react-select';
import {FormGroup, FormControl, ControlLabel, HelpBlock, Alert} from 'react-bootstrap';
import _ from 'lodash';

@connect(state => ({
  createError: state.clustersUI.createError,
  registries: state.registries,
  clusters: state.clusters
}), {create, load, createNode, loadNodes, loadRegistries, loadClusterRegistries})
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
    onHide: PropTypes.func.isRequired,
    okTitle: PropTypes.string,
    existingClusters: PropTypes.array,
    loadRegistries: PropTypes.func.isRequired,
    loadClusterRegistries: PropTypes.func.isRequired,
    registries: PropTypes.array.isRequired,
    clusters: PropTypes.array.isRequired
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
    let registries = this.state.assignedRegistries.map((registry)=> {
      return registry.name;
    });
    console.log('subRegistries ', registries);
    this.refs.error.textContent = '';
    const {fields, existingClusters} = this.props;
    if (_.includes(existingClusters, fields.name.value) && this.props.okTitle === 'Create Cluster') {
      this.refs.error.textContent = 'Cluster with name: "' + fields.name.value + '" already exists. Please use another name.';
      return false;
    }
    return this.props.create(fields.name.value, {"description": fields.description.value, "registries": registries}).then(() => {
      if (typeof(fields.assignedNodes.value) !== 'undefined' && fields.assignedNodes.value.length > 0) {
        fields.assignedNodes.value.map(function createNode(node) {
          if (typeof(node) !== 'undefined') {
            let data = {name: node, cluster: fields.name.value};
            this.props.createNode(data);
          }
        }.bind(this));
      }
    }).then(() =>{
      window.setTimeout(function loadClusters() {this.props.load();}.bind(this), 2000);
      this.props.loadNodes('orphans');
    }).then(() =>{
      this.props.onHide();
    })
    .catch((response) => {
      throw new SubmissionError(response.message);
    });
  }

  componentDidMount() {
    const {fields, cluster} = this.props;
    if (cluster) {
      fields.name.onChange(cluster);
    }
  }

  componentWillMount() {
    const {loadRegistries, cluster, loadClusterRegistries, clusters} = this.props;
    loadRegistries().then(()=> {
      if (!cluster) {
        let registries = this.props.registries;
        registries = registries.map((registry)=> {
          delete registry.disabled;
          return registry;
        });
        this.setState({
          assignedRegistries: registries
        });
        console.log(this.state.assignedRegistries);
      }
    });
    if (cluster) {
      loadClusterRegistries(cluster).then(()=> {
        this.setState({
          assignedRegistries: clusters[cluster].registries
        });
      });
    }
  }

  getAvailableRegistries() {
    let registries = this.props.registries;
    registries = registries.map((registry)=> {
      delete registry.disabled;
      return registry;
    });
    return registries;
  }

  handleSelectChange(value) {
    this.setState({
      assignedRegistries: value
    });
    console.log(this.state.assignedRegistries);
  }

  render() {
    require('react-select/dist/react-select.css');
    const { fields, okTitle } = this.props;
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
                         defaultValue = {cluster === 'undefined' ? '' : cluster}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Registries</ControlLabel>
            <Select ref="registriesSelect"
                    className="nodeSelect"
                    placeholder = "Type to filter for registry"
                    autoFocus
                    multi
                    clearable
                    onChange={this.handleSelectChange.bind(this)}
                    name="assignedRegistries"
                    value={this.state.assignedRegistries}
                    labelKey="name"
                    valueKey="name"
                    options={this.getAvailableRegistries()}
                    searchable />
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
          {typeof(this.props.cluster) === 'undefined' && (
            <FormGroup validationState={fields.assignedNodes.error ? "error" : ""}>
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
          )}
        </form>
        <div ref="error" className="text-danger text-xs-center text-error">
        </div>
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
