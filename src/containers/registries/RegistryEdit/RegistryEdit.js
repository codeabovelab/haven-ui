import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {reduxForm} from 'redux-form';
import {addRegistry, editRegistry, load as loadRegistries} from 'redux/modules/registries/registries';
import {createValidator, required} from 'utils/validation';
import {Dialog} from 'components';
import {Row, Col, FormGroup, FormControl, Checkbox, ControlLabel, HelpBlock} from 'react-bootstrap';
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
  form: 'RegistryEdit',
  fields: [
    'name',
    'host',
    'port',
    'username',
    'password',
    'secured'
  ],
  validate: createValidator({
    name: [required],
    host: [required],
    port: [required],
    username: [required],
    password: [required]
  })
})
export default class RegistryEdit extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,

    fields: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func,
    resetForm: PropTypes.func,
    submitting: PropTypes.bool,
    createError: PropTypes.string,
    valid: PropTypes.bool.isRequired,
    registry: PropTypes.any,
    onHide: PropTypes.func.isRequired,

    addRegistry: PropTypes.func.isRequired,
    editRegistry: PropTypes.func.isRequired,
    loadRegistries: PropTypes.func.isRequired,
    registriesUI: PropTypes.object.isRequired
  };

  constructor(...params) {
    super(...params);
    const {registry, fields} = this.props;
    if (registry) {
      let properties = ['name', 'host', 'port', 'username', 'password'];
      properties.forEach(property => fields[property].onChange(registry[property]));
      if (registry.protocol) {
        fields.secured.value = registry.protocol.toLowerCase() === 'https';
      }
    }
  }

  componentWillMount() {
  }

  static focusSelector = '[name=name]';

  onSubmit() {
    const { fields } = this.props;
    console.log('onSubmit', fields);
    //return this.props.create(fields.name.value);
  }

  render() {
    const { fields } = this.props;

    return (
      <Dialog show
              size="large"
              title={this.props.title}
              submitting={this.props.submitting}
              allowSubmit={this.props.valid}
              onReset={this.props.resetForm}
              onSubmit={this.props.handleSubmit(this.onSubmit.bind(this))}
              onHide={this.props.onHide}
      >
        <form onSubmit={this.props.handleSubmit(this.onSubmit.bind(this))}>
          <FormGroup validationState={fields.name.error ? "error" : ""}>
            <ControlLabel>Name</ControlLabel>

            <FormControl type="text"
                         {...fields.name}
            />

            <FormControl.Feedback />

            {(fields.name.error && fields.name.touched) && (
              <HelpBlock>{fields.name.error}</HelpBlock>
            )}
          </FormGroup>

          <Row>
            <Col xs={8}>
              <FormGroup validationState={fields.host.error ? "error" : ""}>
                <ControlLabel>Host</ControlLabel>

                <FormControl type="text"
                             {...fields.host}
                />

                <FormControl.Feedback />

                {(fields.host.error && fields.host.touched) && (
                  <HelpBlock>{fields.host.error}</HelpBlock>
                )}
              </FormGroup>
            </Col>

            <Col xs={2}>
              <FormGroup validationState={fields.port.error ? "error" : ""}>
                <ControlLabel>Port</ControlLabel>

                <FormControl type="text"
                             {...fields.port}
                />

                <FormControl.Feedback />

                {(fields.port.error && fields.port.touched) && (
                  <HelpBlock>{fields.port.error}</HelpBlock>
                )}
              </FormGroup>
            </Col>

            <Col xs={2}>
              <FormGroup validationState={fields.port.error ? "error" : ""}>
                <ControlLabel />

                <Checkbox validationState={fields.secured.error ? "error" : ""}
                          {...fields.secured}
                >
                  Secure
                </Checkbox>
              </FormGroup>
            </Col>
          </Row>

          <Row>
            <Col xs={6}>
              <FormGroup validationState={fields.username.error ? "error" : ""}>
                <ControlLabel>User name</ControlLabel>

                <FormControl type="text"
                             {...fields.username}
                />

                <FormControl.Feedback />

                {(fields.username.error && fields.username.touched) && (
                  <HelpBlock>{fields.username.error}</HelpBlock>
                )}
              </FormGroup>
            </Col>

            <Col xs={6}>
              <FormGroup validationState={fields.password.error ? "error" : ""}>
                <ControlLabel>Password</ControlLabel>

                <FormControl type="password"
                             {...fields.password}
                />

                <FormControl.Feedback />

                {(fields.password.error && fields.password.touched) && (
                  <HelpBlock>{fields.password.error}</HelpBlock>
                )}
              </FormGroup>
            </Col>
          </Row>
        </form>
      </Dialog>
    );

    /*
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
      let field = fields[fieldName];
      let property = FIELDS[fieldName];
      return (<div key={fieldName} className="form-group" required>
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
    */
  }

  editRegistry() {
    const {registry, addRegistry, editRegistry, loadRegistries, fields, resetForm} = this.props;
    let all = ['name', 'host', 'port', 'secured', 'username', 'password'];
    let data = {};
    all.forEach(fieldName => data[fieldName] = fields[fieldName].value);
    data.protocol = data.secured ? 'HTTPS' : 'HTTP';
    delete data.secured;

    let promise = null;
    if (registry) {
      data.name = registry.name;
      promise = editRegistry(data);
    } else {
      promise = addRegistry(data);
    }
    return promise.then(() => {
      loadRegistries();
      resetForm();
      window.simpleModal.close();
    })
    .catch();
  }
}
