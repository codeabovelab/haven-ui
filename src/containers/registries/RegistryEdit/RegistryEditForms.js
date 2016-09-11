import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {reduxForm} from 'redux-form';
import {addRegistry, editRegistry, load as loadRegistries} from 'redux/modules/registries/registries';
import {createValidator, required} from 'utils/validation';
import {Dialog} from 'components';
import {Grid, Row, ButtonToolbar, Button} from 'react-bootstrap';
import _ from 'lodash';
import RegistryEditFormPrivate from './RegistryEditFormPrivate';
import RegistryEditFormAWS from './RegistryEditFormAWS';
import RegistryEditFormDockerHub from './RegistryEditFormDockerHub';
@connect(state => ({
  registriesUI: state.registriesUI
}), {addRegistry, editRegistry, loadRegistries})
@reduxForm({
  form: 'RegistryEdit',
  fields: [
    'name',
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
/*    if (registry) {
      let properties = ['name', 'username', 'password', 'url', 'region', 'secretKey', 'accessKey', 'registryType', 'disabled', 'readOnly'];
      properties.forEach(property => fields[property].onChange(registry[property]));
      if (registry.protocol) {
        fields.secured.onChange(registry.protocol.toLowerCase() === 'https');
      }
    } else {
      fields.active.onChange(true);
    }
*/
    console.log(this.getTypeIndex());
    this.state = {currentRegType: this.getTypeIndex()};
  }

  config = [
    {
      type: 'PRIVATE',
      url: true,
      secretKey: false,
      accessKey: false,
      region: false,
      name: true,
      username: true,
      password: true,
      disabled: true,
      readOnly: true
    },
    {
      type: 'AWS',
      url: false,
      secretKey: true,
      accessKey: true,
      region: true,
      name: true,
      username: false,
      password: false,
      disabled: true,
      readOnly: true
    },
    {
      type: 'DOCKER_HUB',
      url: false,
      secretKey: false,
      accessKey: false,
      region: false,
      name: true,
      username: true,
      password: false,
      disabled: true,
      readOnly: true
    }
  ];

  onClickButtonType(index) {
    this.setState(
      {currentRegType: index}
    );
  }

  onSubmit() {
    const { fields } = this.props;
//    console.log('onSubmit', fields);

    let data = [];
    data.registryType = this.config[this.state.currentRegType].type;
    let hasValues = false;

    Object.keys(fields).forEach((field) => {
      let isField = this.isField(this.state.currentRegType, field);

      if (isField) {
        console.log(field);
        let value = fields[field].value || fields[field].checked;

        if (typeof value !== "undefined") {
          data[field] = value;
          hasValues = true;

          if (field === "secured") {
            data.protocol = fields[field] ? "HTTPS" : "HTTP";
          }
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

  isField(typeIndex, fieldName) {
    return (fieldName === 'name') ? false : this.config[typeIndex][fieldName];
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

        {this.renderSelectForm(this.state.currentRegType)}

      </Dialog>
    );
  }

  renderSelectForm(index) {
    const init = this.props.registry;
    switch (index) {
      case 1: return ( <RegistryEditFormAWS initialValues={init} /> );
      case 2: return ( <RegistryEditFormDockerHub initialValues={init} /> );
      default: return ( <RegistryEditFormPrivate initialValues={init} /> );
    }
  }

  renderButton(index) {
    return (
      <Button bsSize="large"
              bsStyle={index === this.state.currentRegType ? 'warning' : "default"}
              onClick={this.onClickButtonType.bind(this, index)}>
        {this.config[index].type}
      </Button>
    );
  }

  getTypeIndex() {
    let index = 0;
    if (this.props.registry) {
      const {registryType} = this.props.registry;
      this.config.forEach((it, i) => {
        if (it.type === registryType) {index = i;}
      });
    }
    return index;
  }
}
