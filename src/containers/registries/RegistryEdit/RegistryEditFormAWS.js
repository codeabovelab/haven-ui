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
  form: 'RegistryEditFormAWS',
  fields: [
    'name',
    'secretKey',
    'accessKey',
    'region',
    'registryType',
    'disabled',
    'readOnly'
  ],
  validate: createValidator({
    secretKey: [required],
    accessKey: [required],
    region: [required]
  })
})
export default class RegistryEditFormAWS extends RegistryEditCommon {
  static propTypes= {
    fields: PropTypes.object.isRequired
  };

  render() {
    const {fields} = this.props;
    return (
      <form>
        {this.renderLabel('name', 'Name', fields)}
        {this.renderInput('text', 'secretKey', 'Secret key', 'Secret key', fields)}
        {this.renderInput('text', 'accessKey', 'Access key', 'Access key', fields)}
        {this.renderInput('text', 'region', 'Region', 'Region', fields)}
        {this.renderTwoCheckboxes(fields)}
      </form>
    );
  }
}
