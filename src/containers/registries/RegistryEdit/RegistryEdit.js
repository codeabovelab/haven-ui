/*import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {reduxForm} from 'redux-form';
import {addRegistry, editRegistry, load as loadRegistries} from 'redux/modules/registries/registries';
import {createValidator, required} from 'utils/validation';
import {Dialog} from 'components';
import {Grid, Row, Col, FormGroup, FormControl, Checkbox, ControlLabel, ButtonToolbar, Button, HelpBlock, Thumbnail} from 'react-bootstrap';
import _ from 'lodash';

@connect(state => ({
  registriesUI: state.registriesUI
}), {addRegistry, editRegistry, loadRegistries})
@reduxForm({
  form: 'RegistryEdit',
  fields: [
    'name',
    'password',
    'url',
    'region',
    'secretKey',
    'accessKey',
    'registryType',
    'disabled',
    'readOnly'
  ],
  validate: createValidator({
    name: [required],
    password: [required],
    url: [required],
    region: [required],
    secretKey: [required],
    accessKey: [required],
    registryType: [required]
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
    console.log('this.orops', this.props);
    if (registry) {
      let properties = ['name', 'password', 'url', 'region', 'secretKey', 'accessKey', 'registryType', 'disabled', 'readOnly'];
      properties.forEach(property => fields[property].onChange(registry[property]));
      if (registry.protocol) {
        fields.secured.onChange(registry.protocol.toLowerCase() === 'https');
      }
    } else {
      fields.active.onChange(true);
    }

    this.state = {currentRegType: 0};
  }

  onClickButtonType(index) {
    this.setState(
      {currentRegType: index}
    );
  }

  config = [
    {
      type: 'PRIVATE',
      url: true,
      secretKey: false,
      accessKey: false,
      region: false,
      name: true,
      password: true
    },
    {
      type: 'AWS',
      url: false,
      secretKey: true,
      accessKey: true,
      region: true,
      name: false,
      password: false
    },
    {
      type: 'DOCKER_HUB',
      url: false,
      secretKey: false,
      accessKey: false,
      region: false,
      name: true,
      password: false
    }
  ];

  onSubmit() {
    const { fields } = this.props;
//    console.log('onSubmit', fields);

    let data = {};
    let hasValues = false;

    Object.keys(fields).forEach((field) => {
      let value = fields[field].value || fields[field].checked;

      if (typeof value !== "undefined") {
        data[field] = value;
        hasValues = true;

        if (field === "secured") {
          data.protocol = fields[field] ? "HTTPS" : "HTTP";
        }
      }
    });

//    console.log('data', data, 'hasValues', hasValues);

    if (hasValues) {
      let promise;

      if (this.props.registry) {
        promise = this.props.editRegistry(data).then(() => {
          this.props.loadRegistries();
          this.props.onHide();
        });
      } else {
        promise = this.props.addRegistry(data).then(() => {
          this.props.loadRegistries();
          this.props.onHide();
        });
      }

      return promise;
    }
  }

  render() {
    const {fields} = this.props;
    const indexType = this.state.currentRegType;
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
          <Grid>
            <Row>
                <ButtonToolbar>
                  {this.renderButton(0)}
                  {this.renderButton(1)}
                  {this.renderButton(2)}
                </ButtonToolbar>
             </Row>
          </Grid>

          <hr />

          {this.renderInput('text', 'name', 'Name', 'Name', !this.config[indexType].name )}
          {this.renderInput('password', 'password', 'Password', 'Password', !this.config[indexType].password )}
          {this.renderInput('text', 'url', 'Url', 'Url', !this.config[indexType].url )}
          {this.renderInput('text', 'accessKey', 'Access key', 'Access key', !this.config[indexType].accessKey )}
          {this.renderInput('text', 'secretKey', 'Secret Key', 'Secret Key', !this.config[indexType].secretKey )}
          {this.renderInput('text', 'region', 'Region', 'Region', !this.config[indexType].region )}

          <FormGroup>
            <Grid>
              <Row slassName="show-grid">
                <Col sm={2}>
                  -
                </Col>
                <Col sm={2}>
                  <Checkbox inline {...fields.disabled}>
                    Disabled
                  </Checkbox>
                </Col>
                <Col sm={2}>
                  <Checkbox inline {...fields.readOnly}>
                    Read Only
                  </Checkbox>
                </Col>
              </Row>
            </Grid>
          </FormGroup>

        </form>
      </Dialog>
    );
  }

  renderButton(index) {
    return (
      <Button bsSize="large"
              bsStyle={index === this.state.currentRegType ? 'warning' : ""}
              onClick={this.onClickButtonType.bind(this, index)}>
        {this.config[index].type}
      </Button>
    );
  }

  renderInput(type, fieldName, title, placeholder, hidden) {
    const {fields} = this.props;
    const hide = hidden ? 'hidden' : '';
    let valid = '';

    if (!hidden) {
      valid = (fields[fieldName].error && fields[fieldName].touched) ? "error" : "";
    }

    return (

      <div className={hide}>
        <FormGroup validationState={valid}>
          <Grid>
            <Row slassName="show-grid">
              <Col sm={2}>
                <ControlLabel>{title}</ControlLabel>
              </Col>
              <Col sm={7}>
                <FormControl type={type} placeholder={placeholder} {...fields[fieldName]} />
              </Col>
            </Row>
          </Grid>
        </FormGroup>
      </div>

    );
  }
}
*/
