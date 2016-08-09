import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {reduxForm} from 'redux-form';
import {addRegistry, editRegistry, load as loadRegistries} from 'redux/modules/registries/registries';
import {createValidator, required} from 'utils/validation';
import {Dialog} from 'components';
import {Row, Col, FormGroup, FormControl, Checkbox, ControlLabel, HelpBlock} from 'react-bootstrap';
import _ from 'lodash';

@connect(state => ({
  registriesUI: state.registriesUI
}), {addRegistry, editRegistry, loadRegistries})
@reduxForm({
  form: 'RegistryEdit',
  fields: [
    'active',
    'name',
    'host',
    'port',
    'username',
    'password',
    'protocol',
    'secured'
  ],
  validate: createValidator({
    active: [required],
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
          <Row>
            <Col xs={9}>
              <FormGroup validationState={(fields.name.error && fields.name.touched) ? "error" : ""}>
                <ControlLabel>Name</ControlLabel>

                <FormControl type="text"
                             {...fields.name}
                />

                <FormControl.Feedback />

                {(fields.name.error && fields.name.touched) && (
                  <HelpBlock>{fields.name.error}</HelpBlock>
                )}
              </FormGroup>
            </Col>

            <Col xs={3}>
              <FormGroup validationState={(fields.active.error && fields.active.touched) ? "error" : ""}>
                <ControlLabel />

                <Checkbox validationState={(fields.active.error && fields.active.touched) ? "error" : ""}
                          {...fields.active}
                >
                  Active
                </Checkbox>
              </FormGroup>
            </Col>
          </Row>

          <Row>
            <Col xs={6}>
              <FormGroup validationState={(fields.host.error && fields.host.touched) ? "error" : ""}>
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

            <Col xs={3}>
              <FormGroup validationState={(fields.port.error && fields.port.touched) ? "error" : ""}>
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

            <Col xs={3}>
              <FormGroup validationState={(fields.secured.error && fields.secured.touched) ? "error" : ""}>
                <ControlLabel />

                <Checkbox validationState={(fields.secured.error && fields.secured.touched) ? "error" : ""}
                          {...fields.secured}
                >
                  Secure
                </Checkbox>
              </FormGroup>
            </Col>
          </Row>

          <hr />

          <Row>
            <Col xs={6}>
              <FormGroup validationState={(fields.username.error && fields.username.touched) ? "error" : ""}>
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
              <FormGroup validationState={(fields.password.error && fields.password.touched) ? "error" : ""}>
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
