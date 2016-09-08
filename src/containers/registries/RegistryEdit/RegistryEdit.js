import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {reduxForm} from 'redux-form';
import {addRegistry, editRegistry, load as loadRegistries} from 'redux/modules/registries/registries';
import {createValidator, required} from 'utils/validation';
import {Dialog} from 'components';
import {Grid, Row, Col, FormGroup, FormControl, Checkbox, ControlLabel, HelpBlock, Thumbnail} from 'react-bootstrap';
import _ from 'lodash';

@connect(state => ({
  registriesUI: state.registriesUI
}), {addRegistry, editRegistry, loadRegistries})
@reduxForm({
  form: 'RegistryEdit',
  fields: [
    'username',
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
    username: [required],
    password: [required],
    url: [required],
    region: [required],
    secretKey: [required],
    accessKey: [required],
    registryType: [required],
    disabled: [required],
    readOnly: [required]
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
      let properties = ['active', 'name', 'host', 'port', 'username', 'password'];
      properties.forEach(property => fields[property].onChange(registry[property]));
      if (registry.protocol) {
        fields.secured.onChange(registry.protocol.toLowerCase() === 'https');
      }
    } else {
      fields.active.onChange(true);
    }
  }

  onSubmit() {
    const { fields } = this.props;
    console.log('onSubmit', fields);

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

    console.log('data', data, 'hasValues', hasValues);

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
          <Grid>
            <Row>
              <Col xs={2} md={3}>
                <Thumbnail src="/thumbnail.png"/>
              </Col>
              <Col xs={2} md={3}>
                <Thumbnail src="/thumbnail.png" />
              </Col>
              <Col xs={2} md={3}>
                <Thumbnail src="/thumbnail.png" />
              </Col>
            </Row>
          </Grid>
          <FormGroup controlId="formName">
            <Grid>
              <Row slassName="show-grid">
                <Col sm={2}>
                  <ControlLabel>Name</ControlLabel>
                </Col>
                <Col sm={7}>
                  <FormControl type="text" placeholder="Name" />
                </Col>
              </Row>
            </Grid>
          </FormGroup>

          <FormGroup controlId="formPassword">
            <Grid>
              <Row slassName="show-grid">
                <Col sm={2}>
                  <ControlLabel>Password</ControlLabel>
                </Col>
                <Col sm={7}>
                  <FormControl type="password" placeholder="Passwod" />
                </Col>
              </Row>
            </Grid>
          </FormGroup>

          <FormGroup controlId="formUrl">
            <Grid>
              <Row slassName="show-grid">
                <Col sm={2}>
                  <ControlLabel>Url</ControlLabel>
                </Col>
                <Col sm={7}>
                  <FormControl type="text" placeholder="Url" />
                </Col>
              </Row>
            </Grid>
          </FormGroup>

          <FormGroup controlId="formAccessKey">
            <Grid>
              <Row slassName="show-grid">
                <Col sm={2}>
                  <ControlLabel>Access key</ControlLabel>
                </Col>
                <Col sm={7}>
                  <FormControl type="text" placeholder="Access Key" />
                </Col>
              </Row>
            </Grid>
          </FormGroup>

          <FormGroup controlId="formSecretKey">
            <Grid>
              <Row slassName="show-grid">
                <Col sm={2}>
                  <ControlLabel>Secret key</ControlLabel>
                </Col>
                <Col sm={7}>
                  <FormControl type="text" placeholder="Secret Key" />
                </Col>
              </Row>
            </Grid>
          </FormGroup>

          <FormGroup controlId="formRegion">
            <Grid>
              <Row slassName="show-grid">
                <Col sm={2}>
                  <ControlLabel>Region</ControlLabel>
                </Col>
                <Col sm={7}>
                  <FormControl type="text" placeholder="Region" />
                </Col>
              </Row>
            </Grid>
          </FormGroup>

          <FormGroup controlId="formRegion">
            <Grid>
              <Row slassName="show-grid">
                <Col sm={2}>
                </Col>
                <Col sm={2}>
                  <Checkbox inline>
                    Disabled
                  </Checkbox>
                </Col>
                <Col sm={2}>
                  <Checkbox checked inline>
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
}
