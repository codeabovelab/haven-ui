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
    valid: PropTypes.bool,
    registry: PropTypes.any
  };

  constructor(...params) {
    super(...params);
  }

  render() {
    const {fields} = this.props;
    const valid = this.props.valid;
    return (
      <form onSubmit={this.props.handleSubmit}>
        {this.renderLabel('Name', fields.name)}
        {this.renderInput('text', 'User name', 'User Name', fields.username)}
        {this.renderInput('password', 'Password', 'Password', fields.password)}
        {this.renderInput('text', 'Url', 'Url', fields.url)}
        {this.renderTwoCheckboxes(fields)}
        <hr className="registries-bottom-form-separator"/>
        {this.renderButtonSubmit(valid)}
      </form>
    );
  }
}
