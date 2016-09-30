import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Dialog} from 'components';
import {reduxForm, SubmissionError} from 'redux-form';
import {create} from 'redux/modules/containers/containers';
import {loadNodes, loadContainers, loadDefaultParams} from 'redux/modules/clusters/clusters';
import {loadImages, loadImageTags, searchImages} from 'redux/modules/images/images';
import {load as loadRegistries} from 'redux/modules/registries/registries';
import {Alert, Accordion, Panel} from 'react-bootstrap';
import _ from 'lodash';
import Select from 'react-select';


const EXTRA_FIELDS = {
  containerName: {
    label: 'Container name'
  },
  bindVolumes: {
    label: 'Bind volumes'
  },
  memory: {
    label: 'Memory limit'
  },
  cpuQuota: {
    type: 'integer',
    label: 'CPU quota',
    min: 0,
    description: "100 000 means 100% of 1 CPU. 0 also means 100% of 1 CPU."
  },
  cpuShares: {
    type: 'integer',
    label: 'CPU shares',
    min: 2,
    description: "Default is 1024"
  },
  blkioWeight: {
    type: 'integer',
    label: 'Blkio Weight',
    min: 2,
    max: 1000,
    description: "Default is 500"
  }
};
const EXTRA_FIELDS_KEYS = Object.keys(EXTRA_FIELDS);

@connect(state => ({
  clusters: state.clusters,
  containersUI: state.containersUI,
  images: state.images,
  registries: state.registries
}), {create, loadNodes, loadImages, loadImageTags, searchImages, loadContainers, loadDefaultParams, loadRegistries})
@reduxForm({
  form: 'newContainer',
  fields: ['image', 'tag', 'node', 'registry', 'restart', 'restartRetries'].concat(EXTRA_FIELDS_KEYS)
})
export default class ContainerCreate extends Component {
  static propTypes = {
    clusters: PropTypes.object.isRequired,
    registries: PropTypes.array.isRequired,
    containersUI: PropTypes.object.isRequired,
    images: PropTypes.object.isRequired,
    cluster: PropTypes.object.isRequired,
    create: PropTypes.func.isRequired,
    createError: PropTypes.string,
    loadNodes: PropTypes.func.isRequired,
    loadImages: PropTypes.func.isRequired,
    loadImageTags: PropTypes.func.isRequired,
    searchImages: PropTypes.func.isRequired,
    fields: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func,
    resetForm: PropTypes.func.isRequired,
    loadContainers: PropTypes.func.isRequired,
    loadRegistries: PropTypes.func.isRequired,
    loadDefaultParams: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,

    onHide: PropTypes.func.isRequired
  };
  static focusSelector = '#image-select';

  constructor(...params) {
    super(...params);
    this.state = {
      publish: [{field1: '', field2: ''}],
      environment: [{field1: '', field2: ''}],
      selectImageValue: {value: '', label: ''},
      checkboxes: {checkboxInitial: ''},
      creationLogVisible: ''
    };
  }

  componentWillMount() {
    const {loadNodes, loadImages, cluster, fields, loadRegistries} = this.props;
    loadNodes(cluster.name);
    loadImages();
    loadRegistries();
    fields.restart.value = 'no';
  }

  getTagsOptions(image) {
    let tagsOptions;
    tagsOptions = image && image.tags && image.tags.map(tag => {
      return {value: tag, label: tag};
    }
      );
    return tagsOptions;
  }

  getImageOptions(input, callback) {
    let options = [];
    let registriesArr = this.props.registries.map(function listRegistries(element) {
      let checkBoxState = this.state.checkboxes[element.name];
      if (checkBoxState && checkBoxState.checked === true) {
        return element.name;
      }
    }.bind(this)).filter((element)=>{
      return typeof(element) !== 'undefined';
    });
    let registries = registriesArr.join(', ');
    if (input.length > 0) {
      this.props.dispatch(searchImages(input, 10, 100, registries)).then(() => {
        let results = this.props.images.search.results;
        for (let i = 0; i < results.length; i++) {
          let imageName = results[i].name;
          options.push({value: imageName, label: imageName});
        }
      }).then(()=> {
        callback(null, {options: options});
      });
    }else {
      callback(null, options = {value: '', label: ''});
    }
  }

  updateImageValue(newValue) {
    let registry;
    let image;
    const {fields} = this.props;
    if (newValue.length !== 0) {
      this.setState({
        selectImageValue: newValue
      });
      this.onImageChange(newValue.value);
    } else {
      this.setState({
        selectImageValue: {label: '', value: ''}
      });
    }
    let ValSplitted = this.splitImageName(newValue.value);
    registry = ValSplitted.registry;
    image = ValSplitted.image;
    fields.registry.onChange(registry);
    fields.image.onChange(image);
  }

  updateTagValue(newValue) {
    const {fields} = this.props;
    this.setState({
      selectTagValue: newValue
    });
    this.onTagChange(newValue);
    fields.tag.onChange(newValue);
  }

  toggleCheckbox(e) {
    let checked = e.target.checked;
    let name = e.target.name;
    this.setState({
      checkboxes: $.extend(this.state.checkboxes, {[name]: {checked: checked}})
    });
  }

  displayRegistries() {
    let $checkboxBlock = $('.checkbox-list-image');
    $checkboxBlock.slideToggle(200);
  }

  getImagesList() {
    let imagesList = [];
    const {images} = this.props;
    Object.keys(images).filter((key) => (key === "all")).forEach(registerName => {
      let register = images[registerName];
      _.forOwn(register, image => {
        let i = Object.assign({}, image, {label: `${registerName} | ${image.name}`});
        imagesList.push(i);
      });
    });
    return imagesList;
  }

  render() {
    let s = require('./ContainerCreate.scss');
    require('react-select/dist/react-select.css');
    const {clusters, cluster, fields, containersUI, registries} = this.props;
    const creationLogVisible = this.state.creationLogVisible;
    let clusterDetailed = clusters[cluster.name];// to ensure loading of nodes with loadNodes;
    let nodes = clusterDetailed.nodesList;
    nodes = nodes ? nodes : [];
    let imagesList = this.getImagesList();
    let field;
    let image = this.getCurrentImage();
    let creating = containersUI.new.creating;

    return (
      <Dialog show
              size="large"
              title="Create Container"
              onSubmit={creationLogVisible ? this.props.onHide : this.props.handleSubmit(this.onSubmit.bind(this))}
              onHide={creationLogVisible ? this.props.handleSubmit(this.onSubmit.bind(this)) : this.props.onHide}
              okTitle={creationLogVisible ? "Close" : null}
              cancelTitle={creationLogVisible ? "Again" : null}
      >
          {this.props.createError && (
            <Alert bsStyle="danger">
              {this.props.createError}
            </Alert>
          )}

          <form>
            <div className="form-group" required>
              <label>Image:</label>
              <Select.Async ref="imageSelect"
                            loadOptions={this.getImageOptions.bind(this)}
                            autoFocus
                            name="image"
                            minimumInput={ 1 }
                            cache
                            value={this.state.selectImageValue}
                            autoload
                            placeholder = "Search..."
                            clearable
                            resetValue = ""
                            onChange={this.updateImageValue.bind(this)}
                            searchable={this.state.searchable} />
            </div>
            <div className="button-wrapper">
            <button className = "btn btn-default btn-sm react-select-button" type="button" onClick={this.displayRegistries.bind(this)}>Use custom registries</button>
            </div>
            <div className="checkbox-list checkbox-list-image">
              {
                registries.map(function list(registry, i) {
                  if (typeof(registry) !== 'undefined') {
                    return (<div className="checkbox-button" key={i}><label>
                               <input type="checkbox"
                                      className="checkbox-control registry-checkbox"
                                      value={registry.name}
                                      defaultChecked={false}
                                      onChange={this.toggleCheckbox.bind(this)}
                                      name={registry.name}
                                     />
                               <span className="checkbox-label">{registry.name}</span>
                            </label></div>);
                  }
                }.bind(this))
              }
            </div>

            <div className="form-group">
              <label>Tag:</label>
              <Select ref="tagSelect"
                      simpleValue
                      clearable
                      name="tag"
                      value={this.state.selectTagValue}
                      onChange={this.updateTagValue.bind(this)}
                      options={this.getTagsOptions(image)}
                      searchable />
            </div>
            <div className="form-group">
              <label>Node:</label>
              {(field = fields.node) && ''}
              <select className="form-control" {...field}>
                <option />
                {nodes && nodes.map(name =>
                  <option key={name} value={name}>{name}</option>
                )}
              </select>
            </div>
            <Accordion className="accordion-create-container">
              <Panel header="Container & Volumes settings" eventKey="1">
                <div className="row">
                  {EXTRA_FIELDS_KEYS.map(key =>
                    <div className="col-md-6" key={key}>
                      {fieldComponent(key)}
                    </div>
                  )}
                </div>
              </Panel>
              <Panel header="Ports settings" eventKey="2">
                {this.fieldPublish()}
              </Panel>
            </Accordion>
            {this.fieldRestart()}
            <div className="form-group" id="creation-log-block">
              <label>Creation Log: <i className="fa fa-spinner fa-2x fa-pulse"/></label>
              <textarea readOnly
                        className="container-creation-log"
                        defaultValue=""
                        id="creation-log"
              />
            </div>
          </form>
      </Dialog>
    );


    function fieldComponent(name) {
      let property = EXTRA_FIELDS[name];
      let field = fields[name];
      return (
        <div className="form-group">
          <label>{property.label}:</label>
          {field.error && field.touched && <div className="text-danger">{field.error}</div>}
          {inputField(property, field)}
          {property.description && <small className="text-muted">{property.description}</small>}
        </div>
      );
    }

    function inputField(property, field) {
      switch (property.type) {
        case 'integer':
          return inputNumber(property, field);
        default:
          return inputText(property, field);
      }
    }

    function inputText(property, field) {
      return <input type="text" {...field} className="form-control"/>;
    }

    function inputNumber(property, field) {
      let props = Object.assign({}, field, _.pick(property, ['min', 'max']));
      return <input type="number" step="1" {...props} className="form-control"/>;
    }
  }

  getCurrentImage() {
    const {images, fields} = this.props;
    let imageName = this.state.selectImageValue.value;
    if (!imageName) {
      return null;
    }
    let image = null;
    _.forOwn(images, register => {
      if (register[imageName]) {
        image = register[imageName];
      }
    });
    return image;
  }

  onImageChange(value) {
    const {loadImageTags} = this.props;
    if (value) {
      loadImageTags(value);
    }
  }

  splitImageName(value) {
    let result = {image: '', registry: ''};
    if (typeof(value) !== 'undefined') {
      let imageValSplitted = value.split('/');
      if (imageValSplitted.length === 2) {
        result.registry = imageValSplitted[0];
        result.image = imageValSplitted[1];
      } else {
        result.image = imageValSplitted[0];
      }
    }
    return result;
  }

  onTagChange(value) {
    const {cluster, loadDefaultParams, fields} = this.props;
    let image = fields.image.value;
    let registry = fields.registry.value;
    let tag = value;
    if (tag && image) {
      loadDefaultParams({clusterId: cluster.name, image, tag, registry})
        .then((defaultParams) => {
          _.forOwn(defaultParams, (value, key) => {
            if (['tag'].indexOf(key) > -1) return;

            if (fields[key] !== undefined && !fields[key].value) {
              fields[key].onChange(value);
            }
          });
        });
    }
  }

  onSubmit() {
    this.create();
  }

  create() {
    const {fields, create, cluster, resetForm, loadContainers} = this.props;
    let container = {
      cluster: cluster.name
    };

    let fieldNames = ['image', 'tag', 'node'].concat(EXTRA_FIELDS_KEYS);
    fieldNames.forEach(key => {
      let value = fields[key].value;
      if (value) {
        container[key] = value;
      }
    });
    let $logBlock = $('#creation-log-block');
    let $spinner = $logBlock.find('i');
    container.publish = this.getPublish();
    container.environment = this.getEnvironment();
    container.restart = this.getRestart();
    $logBlock.show();
    this.setState({
      creationLogVisible: true
    });
    $spinner.show();
    return create(container)
      .then((response) => {
        $('#creation-log').val(response._res.text);
        $spinner.hide();
        return loadContainers(cluster.name);
      })
      .catch((response) => {
        $spinner.hide();
        throw new SubmissionError(response.message);
      });
  }

  fieldPublish() {
    let items = this.state.publish;
    return (
      <div className="field-publish">
        <div className="field-header">
          <label>Publish</label>
          <a onClick={this.addPublishItem.bind(this)}><i className="fa fa-plus-circle"/></a>
        </div>
        <div className="field-body">
          {items.map((item, key) => <div className="row" key={key}>
            <div className="col-sm-6">
              <input type="number" onChange={handleChange.bind(this, key, 'field1')} className="form-control"
                     placeholder="Port"/>
            </div>
            <div className="col-sm-6">
              <input type="number" onChange={handleChange.bind(this, key, 'field2')} className="form-control"
                     placeholder="Port"/>
            </div>
          </div>)}
        </div>
      </div>
    );

    function handleChange(i, type, event) {
      let state = Object.assign({}, this.state);
      state.publish[i][type] = event.target.value;
      this.setState(state);
    }
  }

  addPublishItem() {
    this.setState({
      ...this.state,
      publish: [...this.state.publish, {field1: '', field2: ''}]
    });
  }

  getPublish() {
    return this.getMapField('publish');
  }

  fieldEnvironment() {
    let items = this.state.environment;
    return (
      <div className="field-environment">
        <div className="field-header">
          <label>Environment</label>
          <a onClick={this.addEnvironmentItem.bind(this)}><i className="fa fa-plus-circle"/></a>
        </div>
        <div className="field-body">
          {items.map((item, key) => <div className="row" key={key}>
            <div className="col-sm-6">
              <input type="text" onChange={handleChange.bind(this, key, 'field1')} className="form-control"
                     placeholder=""/>
            </div>
            <div className="col-sm-6">
              <input type="text" onChange={handleChange.bind(this, key, 'field2')} className="form-control"
                     placeholder=""/>
            </div>
          </div>)}
        </div>
      </div>
    );

    function handleChange(i, type, event) {
      let state = Object.assign({}, this.state);
      state.environment[i][type] = event.target.value;
      this.setState(state);
    }
  }

  addEnvironmentItem() {
    this.setState({
      ...this.state,
      environment: [...this.state.environment, {field1: '', field2: ''}]
    });
  }

  getEnvironment() {
    return this.getMapField('environment');
  }

  getMapField(field) {
    let list = this.state[field];
    let map = {};
    list.forEach(item => {
      if (item.field1 && item.field2) {
        map[item.field1] = item.field2;
      }
    });
    return map;
  }

  fieldRestart() {
    let {fields: {restart, restartRetries}} = this.props;
    let values = ['no', 'on-failure', 'always', 'unless-stopped'];
    return (
      <div className="form-group">
        <div className="field-restart">
          <div className="field-header">
            <label>Restart policy:</label>
          </div>
          <div className="field-body">
            <div className="row">
              <div className="col-sm-6">
                <select className="form-control" {...restart}>
                  {values.map(value =>
                    <option key={value} value={value}>{value}</option>
                  )}
                </select>
              </div>
              {(restart.value === "on-failure") && <div className="col-sm-6">
                <input {...restartRetries} type="number" step="1" min="0"
                       className="form-control" placeholder="max retries"/>
              </div>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  getRestart() {
    let {fields: {restart, restartRetries}} = this.props;
    let value = restart.value;
    if (restart.value === "on-failure" && restartRetries.value) {
      value += `[:${restartRetries.value}]`;
    }
    return value;
  }
}
