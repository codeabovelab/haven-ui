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
  form: 'RegistryEditFormPrivate',
  fields: [
    'name',
    'username',
    'password',
    'url',
    'registryType',
    'disabled',
    'readOnly'
  ],
  validate: createValidator({
    username: [required],
    password: [required],
    url: [required]
  })
})
export default class RegistryEditFormPrivate extends RegistryEditCommon {
  static propTypes= {
    fields: PropTypes.object.isRequired,
    registry: PropTypes.any,
    onSubmitForm: PropTypes.func.isRequired
  };

  constructor(...params) {
    super(...params);
  }

  render() {
    const {fields} = this.props;
    return (
      <form >
        {this.renderLabel('name', 'Name', fields)}
        {this.renderInput('text', 'username', 'User name', 'User Name', fields)}
        {this.renderInput('password', 'password', 'Password', 'Password', fields)}
        {this.renderInput('text', 'url', 'Url', 'Url', fields)}
        {this.renderTwoCheckboxes(fields)}
      </form>
    );
  }
}
