import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Field, reduxForm, SubmissionError} from 'redux-form';
import {load, create, loadNodes, loadClusterRegistries, update} from 'redux/modules/clusters/clusters';
import {create as createNode} from 'redux/modules/nodes/nodes';
import {createValidator, required, alphanumeric, maxLength} from 'utils/validation';
import {Dialog} from 'components';
import {load as loadRegistries} from 'redux/modules/registries/registries';
import Select from 'react-select';
import {FormGroup, FormControl, ControlLabel, HelpBlock, Alert, Label} from 'react-bootstrap';
import _ from 'lodash';

@connect(state => ({
  createError: state.clustersUI.createError,
  registries: state.registries
}), {create, load, createNode, loadNodes, loadRegistries, loadClusterRegistries, update})
@reduxForm({
  form: 'ClusterAdd',
  fields: [
    'name',
    'description',
    'assignedNodes',
    'filter'
  ],
  validate: createValidator({
    name: [required, alphanumeric],
    description: [maxLength(128)]
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
    filter: PropTypes.string,
    strategy: PropTypes.string,
    ownRegistries: PropTypes.any,
    onHide: PropTypes.func.isRequired,
    okTitle: PropTypes.string,
    existingClusters: PropTypes.array,
    loadRegistries: PropTypes.func.isRequired,
    loadClusterRegistries: PropTypes.func.isRequired,
    registries: PropTypes.object.isRequired,
    update: PropTypes.func.isRequired
  };

  STRATEGIES = [
    {
      value: "DEFAULT",
      label: "DEFAULT"
    },
    {
      value: "SPREAD",
      label: "SPREAD"
    },
    {
      value: "BINPACK",
      label: "BINPACK"
    },
    {
      value: "RANDOM",
      label: "RANDOM"
    }
  ];

  constructor() {
    super();
    this.state = {
      firstLoad: true,
      strategy: ''
    };
  }

  onSubmit() {
    const { create, update, cluster, resetForm } = this.props;
    this.setState({
      firstLoad: false
    });
    let submitAction = create;
    let registries = this.state.assignedRegistries.map((registry)=> {
      let el = registry.name ? registry.name : registry;
      el = el === 'Docker Hub' ? '' : el;
      return el;
    });
    this.refs.error.textContent = '';
    const {fields, existingClusters} = this.props;
    if (_.includes(existingClusters, fields.name.value) && this.props.okTitle === 'Create Cluster') {
      this.refs.error.textContent = 'Cluster with name: "' + fields.name.value + '" already exists. Please use another name.';
      return false;
    }
    let payload = {
      "config": {"registries": registries, "strategy": this.state.strategy},
      "description": fields.description.value,
      "filter": fields.filter.value
    };
    if (cluster) {
      delete payload.config.strategy;
      submitAction = update;
    }
    return submitAction(fields.name.value, payload).then(() => {
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
      resetForm();
      this.props.onHide();
    })
    .catch((response) => {
      throw new SubmissionError(response.message);
    });
  }

  componentDidMount() {
    const {fields, cluster, description, filter} = this.props;
    if (cluster) {
      fields.name.onChange(cluster);
    }
    if (description) {
      fields.description.onChange(description);
    }
    if (filter) {
      fields.filter.onChange(filter);
    }
  }

  componentWillMount() {
    const {loadRegistries, cluster, ownRegistries, strategy} = this.props;
    loadRegistries().then(()=> {
      if (!cluster) {
        let registries = this.props.registries;
        registries = this.editProps(registries);
        this.setState({
          assignedRegistries: registries,
          strategy: this.STRATEGIES[0].value
        });
      }
    });
    if (cluster) {
      let registriesFiltered = ownRegistries.map((el)=> {
        return el.length === 0 ? 'Docker Hub' : el;
      });
      this.setState({
        assignedRegistries: registriesFiltered,
        strategy: strategy
      });
    }
  }

  renderSelectValue(option) {
    return <Label className="Select-value-success">{option.name}</Label>;
  }

  editProps(registries) {
    return _.map(registries, (registry)=> {
      delete registry.disabled;
      registry.name = registry.name ? registry.name : registry.title;
      registry.className = "Select-value-success";
      return registry;
    });
  }

  getAvailableRegistries() {
    let registries = this.props.registries;
    registries = this.editProps(registries);
    return registries;
  }

  handleSelectChange(value) {
    this.setState({
      assignedRegistries: value
    });
  }

  handleStrategyChange(event) {
    let value = event.target ? event.target.value : event.value;
    this.setState({
      strategy: value
    });
  }

  render() {
    require('react-select/dist/react-select.css');
    require('css/theme/component-overrides/react-select.scss');
    const { fields, okTitle } = this.props;
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
          <FormGroup title="required" required validationState={
            (fields.name.error && (!this.state.firstLoad || fields.name.touched || fields.name.error !== 'Required')) ? "error" : ""}
          >
            <ControlLabel>Name</ControlLabel>
            <FormControl type="text"
                         {...fields.name}
                         placeholder="Name (required)"
                         disabled = {okTitle === 'Update Cluster'}
            />
            {fields.name.error && (fields.name.touched || fields.name.error !== 'Required') && (
              <HelpBlock>{fields.name.error}</HelpBlock>
            )}
          </FormGroup>
          <FormGroup>
            <ControlLabel>Registries</ControlLabel>
            <Select ref="registriesSelect"
                    className="regSelect"
                    placeholder = "Type to filter for registry"
                    autoFocus
                    multi
                    clearable
                    valueRenderer={this.renderSelectValue}
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
            />
            {fields.description.error && (
              <HelpBlock>{fields.description.error}</HelpBlock>
            )}
          </FormGroup>
          <FormGroup>
            <ControlLabel>Filter</ControlLabel>
            <FormControl type="text"
                         {...fields.filter}
                         placeholder="Filter"
            />
          </FormGroup>
              <FormGroup>
                <ControlLabel>Strategy</ControlLabel>
                <FormControl componentClass="select" id="Strategy" value={this.state.strategy}
                             onChange={this.handleStrategyChange.bind(this)} disabled={this.props.cluster}>
                  {
                    this.STRATEGIES.map((el, i) => {
                      return <option key={i} value={el.value}>{el.label}</option>;
                    })
                  }
                </FormControl>
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
