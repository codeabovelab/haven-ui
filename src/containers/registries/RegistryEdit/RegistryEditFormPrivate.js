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
    registry: PropTypes.any,
    firstLoad: PropTypes.bool.isRequired,
    okTitle: PropTypes.string.isRequired
  };

  constructor(...params) {
    super(...params);
  }

  render() {
    const {fields, firstLoad, okTitle} = this.props;
    const valid = this.props.valid;
    return (
      <form onSubmit={this.props.handleSubmit}>
        {this.renderLabel('Name', fields.name)}
        {this.renderInput('text', 'User name', 'Username (required)', fields.username, firstLoad)}
        {this.renderInput('password', 'Password', 'Password (required)', fields.password, firstLoad)}
        {this.renderInput('text', 'URL', 'URL (required)', fields.url, firstLoad)}
        {this.renderTwoCheckboxes(fields)}
        <hr className="bottom-form-separator"/>
        {this.renderButtonSubmit(valid, okTitle)}
      </form>
    );
  }
}
