import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {reduxForm} from 'redux-form';
import {addRegistry, editRegistry, load as loadRegistries} from 'redux/modules/registries/registries';
import {createValidator, required} from 'utils/validation';
import RegistryEditCommon from './RegistryEditCommon';

@connect(state => ({
  registriesUI: state.registriesUI
}), {addRegistry, editRegistry, loadRegistries})
@reduxForm({
  form: 'RegistryEditFormDockerHub',
  fields: [
    'name',
    'username',
    'password',
    'registryType',
    'disabled',
    'readOnly'
  ],
  validate: createValidator({
    username: [required],
    password: [required]
  })
})
export default class RegistryEditFormDockerHub extends RegistryEditCommon {
  static propTypes= {
    fields: PropTypes.object.isRequired
  };

  render() {
    const {fields} = this.props;
    return (
      <form>
        {this.renderLabel('name', 'Name', fields)}
        {this.renderInput('text', 'username', 'User name', 'User name', fields)}
        {this.renderInput('password', 'password', 'Password', 'Password', fields)}
        {this.renderTwoCheckboxes(fields)}
      </form>
    );
  }
}
