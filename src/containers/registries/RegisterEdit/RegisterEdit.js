import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {reduxForm} from 'redux-form';
import {addRegistry, editRegistry, load as loadRegistries} from 'redux/modules/registries/registries';
import registerValidation from './registerValidation';
import _ from 'lodash';

const FIELDS = {
  name: {
    label: 'Name'
  },
  host: {
    label: 'Host'
  },
  port: {
    label: 'Port',
    type: 'integer',
    min: 1
  },
  secured: {
    label: 'Secured',
    type: 'secured'
  },
  username: {
    label: 'Username'
  },
  password: {
    label: 'Password',
    type: 'password'
  }
};
@connect(state => ({
  registriesUI: state.registriesUI
}), {addRegistry, editRegistry, loadRegistries})
@reduxForm({
  form: 'registerEdit',
  validate: registerValidation,
  fields: ['name', 'host', 'port', 'username', 'password', 'secured']
})
export default class RegisterEdit extends Component {
  static propTypes = {
    registry: PropTypes.object,
    addRegistry: PropTypes.func.isRequired,
    loadRegistries: PropTypes.func.isRequired,
    fields: PropTypes.object.isRequired,
    resetForm: PropTypes.func.isRequired,
    registriesUI: PropTypes.object.isRequired,
    valid: PropTypes.bool.isRequired
  };

  componentWillMount() {
    const {registry, fields} = this.props;
    if (registry) {
      let properties = ['name', 'host', 'port', 'username', 'password'];
      properties.forEach(property => fields[property].value = registry[property]);
      fields.secured.value = registry.protocol.toLowerCase() === 'https';
    }
  }

  static focusSelector = '[name=name]';

  render() {
    const {registry, fields, registriesUI: {adding, addingError}, valid} = this.props;
    let field;

    return (
      <div className="modal-content">
        <div className="modal-header">
          <button type="button" className="close" data-dismiss="modal">
            <span aria-hidden="true">&times;</span>
          </button>
          <h4 className="modal-title">{registry ? registry.name : 'Add Register'}
            {adding && <span>{' '}<i className="fa fa-spinner fa-pulse"/></span>}
          </h4>
        </div>
        <div className="modal-body">
          <form>
            {!registry && fieldComponent('name')}
            {fieldComponent('host')}
            {fieldComponent('port')}
            {inputSecured('secured')}
            {fieldComponent('username')}
            {fieldComponent('password')}
            <div className="text-danger">{addingError}</div>
          </form>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={this.editRegistry.bind(this)}
                  disabled={adding || !valid}>
            {!registry && <span><i className="fa fa-plus"/> Add</span>}
            {registry && <span><i className="fa fa-save"/> Save</span>}
          </button>
        </div>
      </div>
    );

    function fieldComponent(fieldName) {
      let property = FIELDS[fieldName];
      return (<div key={fieldName} className="form-group" required>
        {(field = fields[fieldName]) && ''}
        <label>{property.label}</label>
        {field.error && field.value && field.touched && <div className="text-danger">{field.error}</div>}
        {inputField(property, field)}
      </div>);
    }

    function inputField(property, field) {
      switch (property.type) {
        case 'integer':
          return inputNumber(property, field);
        case 'password':
          return inputPassword(property, field);
        case 'secured':
          return inputSecured(property, field);
        default:
          return inputText(property, field);
      }
    }

    function inputText(property, field) {
      return <input type="text" {...field} className="form-control"/>;
    }

    function inputPassword(property, field) {
      return <input type="password" {...field} className="form-control"/>;
    }

    function inputNumber(property, field) {
      let props = Object.assign({}, field, _.pick(property, ['min', 'max']));
      return <input type="number" step="1" {...props} className="form-control"/>;
    }

    function inputSecured(fieldName) {
      let property = FIELDS[fieldName];
      let field = fields[fieldName];
      return (<div className="checkbox">
        <label>
          <input type="checkbox" {...field}/>
          {property.label}
        </label>
      </div>);
    }
  }

  editRegistry() {
    const {registry, addRegistry, loadRegistries, fields, resetForm} = this.props;
    let all = ['name', 'host', 'port', 'secured', 'username', 'password'];
    let data = {};
    all.forEach(fieldName => data[fieldName] = fields[fieldName].value);
    data.protocol = data.secured ? 'HTTPS' : 'HTTP';
    delete data.secured;

    let promise = null;
    if (registry){
      data.name = registry.name;
      promise = editRegistry(data);
    }  else {
      promise = addRegistry(data);
    }
    return promise(data)
      .then(() => {
        loadRegistries();
        resetForm();
        window.simpleModal.close();
      })
      .catch();
  }
}
