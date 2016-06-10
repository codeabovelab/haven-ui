import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {reduxForm} from 'redux-form';
import {addRegister} from 'redux/modules/images/images';
import _ from 'lodash';

@connect(state => ({
  imagesUI: state.imagesUI
}), {addRegister})
@reduxForm({
  form: 'registerAdd',
  fields: ['name']
})
export default class RegisterAdd extends Component {
  static propTypes = {
    addRegister: PropTypes.func.isRequired,
    fields: PropTypes.object.isRequired,
    resetForm: PropTypes.func.isRequired,
    imagesUI: PropTypes.object.isRequired
  };
  static focusSelector = '#name';

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
            <div className="form-group" required>
              {(field = fields.name) && ''}
              <label>Name</label>
              {field.error && field.touched && <div className="text-danger">{field.error}</div>}
              {inputText(field)}
            </div>
          </form>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={this.addRegister.bind(this)} disabled={adding}>
            Add
          </button>
        </div>
      </div>
    );

    function inputText(field) {
      return <input type="text" {...field} className="form-control"/>;
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
