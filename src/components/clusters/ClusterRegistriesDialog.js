import React, {Component, PropTypes} from 'react';
import {Field, reduxForm, SubmissionError} from 'redux-form';
import {createValidator, required} from 'utils/validation';
import {Dialog} from 'components';
import Select from 'react-select';
import {FormGroup, ControlLabel, Label} from 'react-bootstrap';

export default class ClusterRegistriesDialog extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    clusters: PropTypes.object,
    update: PropTypes.func.isRequired,
    ownRegistries: PropTypes.any,
    onHide: PropTypes.func.isRequired,
    okTitle: PropTypes.string,
    loadClusterRegistries: PropTypes.func.isRequired,
    availableRegistries: PropTypes.array.isRequired,
    clusterName: PropTypes.string.isRequired
  };

  onSubmit() {
    const {update, clusters, loadClusterRegistries, clusterName} = this.props;
    let registries = this.state.assignedRegistries.map((registry)=> {
      let el = registry.name ? registry.name : registry;
      el = el === 'Docker Hub' ? '' : el;
      return el;
    });
    update(clusterName, {"config": {"registries": registries}})
      .then(() => loadClusterRegistries(clusterName))
      .then(() => {
        this.props.onHide();
      });
  }

  componentWillMount() {
    const {ownRegistries} = this.props;
    let registriesFiltered = ownRegistries.map((el)=> {
      return el.length === 0 ? 'Docker Hub' : el;
    });
    this.setState({
      assignedRegistries: registriesFiltered
    });
  }

  renderSelectValue(option) {
    return <Label className="Select-value-success">{option.name}</Label>;
  }

  handleSelectChange(value) {
    this.setState({
      assignedRegistries: value
    });
  }

  editProps(registries) {
    return registries.map((registry)=> {
      delete registry.disabled;
      if (registry.name.trim().length === 0) {
        registry.name = registry.title;
      }
      registry.className = "Select-value-success";
      return registry;
    });
  }

  getAvailableRegistries() {
    let registries = this.props.availableRegistries;
    registries = this.editProps(registries);
    return registries;
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
                    valueRenderer={this.renderSelectValue}
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
