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
export default class RegistryEdit extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    handleSubmit: PropTypes.func,
    resetForm: PropTypes.func,
    submitting: PropTypes.bool,
    createError: PropTypes.string,
    registry: PropTypes.any,
    onHide: PropTypes.func.isRequired,
    addRegistry: PropTypes.func.isRequired,
    editRegistry: PropTypes.func.isRequired,
    loadRegistries: PropTypes.func.isRequired,
    registriesUI: PropTypes.object.isRequired,
    okTitle: PropTypes.string.isRequired
  };

  constructor(...params) {
    super(...params);
    this.state = {
      currentRegType: this.getType(),
      firstLoad: true
    };
  }

  configType = [
    'PRIVATE',
    'AWS',
    'DOCKER_HUB'
  ];

  onSubmit(values) {
    delete values.name;
    values.registryType = this.getCurrentType();
//    values.name = values.username;
    this.setState({
      firstLoad: false
    });
    let promise;

    if (this.props.registry) {
      promise = this.props.editRegistry(values).then(() => {
        this.props.loadRegistries();
        this.props.onHide();
      });
    } else {
      promise = this.props.addRegistry(values).then(() => {
        this.props.loadRegistries();
        this.props.onHide();
      });
    }

    return promise;
  }

  render() {
    const hidden = true;
    return (
      <Dialog show
              role="document"
              size="large"
              title={this.props.title}
              hideCancel={hidden}
              hideOk={hidden}
              hideFooter={hidden}
              onReset={this.props.resetForm}
              onHide={this.props.onHide}
      >
        <ButtonToolbar>
          {this.renderButton(this.configType[0])}
          {this.renderButton(this.configType[1])}
          {this.renderButton(this.configType[2])}
        </ButtonToolbar>

        <hr className="top-form-separator" />

        {this.renderSelectForm(this.state.currentRegType)}

      </Dialog>
    );
  }

  renderSelectForm(type) {
    const init = this.getInit();
    const firstLoad = this.state.firstLoad;
    switch (type) {
      case this.configType[1]:
        return ( <RegistryEditFormAWS
          initialValues={init}
          firstLoad={firstLoad}
          onHide={this.props.onHide}
          okTitle={this.props.okTitle}
          onSubmit={this.onSubmit.bind(this)} />);
      case this.configType[2]:
        return ( <RegistryEditFormDockerHub
          initialValues={init}
          firstLoad={firstLoad}
          onHide={this.props.onHide}
          okTitle={this.props.okTitle}
          onSubmit={this.onSubmit.bind(this)} />);
      default:
        return ( <RegistryEditFormPrivate
          initialValues={init}
          firstLoad={firstLoad}
          onHide={this.props.onHide}
          okTitle={this.props.okTitle}
          onSubmit={this.onSubmit.bind(this)} />);
    }
  }

  renderButton(type) {
    return (
      <Button bsStyle={type === this.getCurrentType() ? 'primary' : "default"}
              onClick={this.onClickButtonType.bind(this, type)}
              disabled={this.isEdit() } >
        {type}
      </Button>
    );
  }

  onClickButtonType(type) {
    this.setState(
      {currentRegType: type}
    );
  }

  getCurrentType() {
    return this.state.currentRegType;
  }

  getInit() {
    let init = '';
    if (this.props.registry) {
      init = this.props.registry;
    } else {
      init = {
        disabled: false,
        readOnly: false,
        registryType: "PRIVATE",
        username: "",
        password: "",
        name: "",
        url: "https://ni1.codeabovelab.com"
      };
    }
    return init;
  }

  getType() {
    let registryType;

    if (this.props.registry) {
      registryType = this.props.registry.registryType;
    } else {
      registryType = "PRIVATE";
    }

    if (registryType === 'undefined') {
      console.lod('registryType UNDEFINED');
    }
    return registryType;
  }

  isEdit() {
    return this.props.registry ? true : false;
  }
}
