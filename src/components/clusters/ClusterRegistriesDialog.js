import React, {Component, PropTypes} from 'react';
import {Field, reduxForm, SubmissionError} from 'redux-form';
import {load, create, loadNodes, loadClusterRegistries} from 'redux/modules/clusters/clusters';
import {createValidator, required} from 'utils/validation';
import {Dialog} from 'components';
import Select from 'react-select';
import {FormGroup, ControlLabel} from 'react-bootstrap';

export default class ClusterRegistriesDialog extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    clusters: PropTypes.object,
    create: PropTypes.func.isRequired,
    ownRegistries: PropTypes.any,
    onHide: PropTypes.func.isRequired,
    okTitle: PropTypes.string,
    loadClusterRegistries: PropTypes.func.isRequired,
    registries: PropTypes.array.isRequired,
    clusterName: PropTypes.string.isRequired
  };

  onSubmit() {
    const {create, clusters, loadClusterRegistries, clusterName} = this.props;
    let registries = this.state.assignedRegistries.map((registry)=> {
      return registry.name ? registry.name : registry;
    });
    create(clusterName, {"config": {"registries": registries}, "description": clusters[clusterName].description})
      .then(() => loadClusterRegistries(clusterName))
      .then(() => {
        this.props.onHide();
      });
  }

  componentWillMount() {
    const {ownRegistries} = this.props;
    this.setState({
      assignedRegistries: ownRegistries
    });
  }

  removeDisabledProp(registries) {
    return registries.map((registry)=> {
      delete registry.disabled;
      registry.className = "Select-value-success";
      return registry;
    });
  }

  getAvailableRegistries() {
    let registries = this.props.registries;
    registries = this.removeDisabledProp(registries);
    return registries;
  }

  handleSelectChange(value) {
    this.setState({
      assignedRegistries: value
    });
  }

  render() {
    require('react-select/dist/react-select.css');
    require('css/theme/component-overrides/react-select.scss');
    return (
      <Dialog show
              size="large"
              title={this.props.title}
              onSubmit={this.onSubmit.bind(this)}
              onHide={this.props.onHide}
      >
        <form>
          <FormGroup>
            <ControlLabel>Registries</ControlLabel>
            <Select ref="registriesSelect"
                    className="regSelect"
                    placeholder="Type to filter for registry"
                    autoFocus
                    multi
                    clearable
                    onChange={this.handleSelectChange.bind(this)}
                    name="assignedRegistries"
                    value={this.state.assignedRegistries}
                    labelKey="name"
                    valueKey="name"
                    options={this.getAvailableRegistries()}
                    searchable/>
          </FormGroup>
        </form>
      </Dialog>
    );
  }
}
