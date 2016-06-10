import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {reduxForm} from 'redux-form';
import {addRegister} from 'redux/modules/images/images';
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
  username: {
    label: 'Username'
  },
  password: {
    label: 'Password'
  }
};
@connect(state => ({
  imagesUI: state.imagesUI
}), {addRegister})
@reduxForm({
  form: 'registerAdd',
  fields: ['name', 'host', 'port', 'username', 'password']
})
export default class RegisterAdd extends Component {
  static propTypes = {
    addRegister: PropTypes.func.isRequired,
    fields: PropTypes.object.isRequired,
    resetForm: PropTypes.func.isRequired,
    imagesUI: PropTypes.object.isRequired
  };

  static focusSelector = '[name=name]';

  render() {
    const {fields, imagesUI} = this.props;
    let adding = imagesUI.new_register.adding;
    let field;

    return (
      <div className="modal-content">
        <div className="modal-header">
          <button type="button" className="close" data-dismiss="modal">
            <span aria-hidden="true">&times;</span>
          </button>
          <h4 className="modal-title">Add Register
            {adding && <span>{' '}<i className="fa fa-spinner fa fa-pulse"/></span>}
          </h4>
        </div>
        <div className="modal-body">
          <form>
            {fieldComponent('name')}
            {fieldComponent('host')}
            {fieldComponent('port')}
            {fieldComponent('username')}
            {fieldComponent('password')}
          </form>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={this.addRegister.bind(this)} disabled={adding}>
            <i className="fa fa-plus"/> Add
          </button>
        </div>
      </div>
    );

    function fieldComponent(fieldName) {
      let property = FIELDS[fieldName];
      return (<div key={fieldName} className="form-group" required>
        {(field = fields[fieldName]) && ''}
        <label>{property.label}</label>
        {field.error && field.touched && <div className="text-danger">{field.error}</div>}
        {inputField(property, field)}
      </div>);
    }

    function inputField(property, field) {
      switch (property.type) {
        case 'integer':
          return inputNumber(property, field);
        case 'password':
          return inputPassword(property, field);
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
  }

  addRegister() {
    const {addRegister, fields, resetForm} = this.props;
    let register = {
      name: fields.name.value
    };
    return addRegister(register)
      .then(() => {
        resetForm();
        window.simpleModal.close();
      })
      .catch();
  }
}
