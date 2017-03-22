import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Dialog} from 'components';
import {reduxForm, SubmissionError} from 'redux-form';
import {create, loadDetails} from 'redux/modules/containers/containers';
import {loadNodes, loadContainers, loadDefaultParams} from 'redux/modules/clusters/clusters';
import {loadImages, loadImageTags, searchImages} from 'redux/modules/images/images';
import {Alert, Accordion, Panel, Label} from 'react-bootstrap';
import _ from 'lodash';
import Select from 'react-select';


const CPU_FIELDS = {
  memoryLimit: {
    type: 'string',
    label: 'Memory Limit',
    description: 'A positive integer followed by k, m, g or t.'
  },
  cpusetCpus: {
    type: 'string',
    label: 'CPU SET CPUS',
    description: "CPUs in which to allow execution (0-3, 0,1)"
  },
  cpusetMems: {
    type: 'string',
    label: 'CPU SET MEMS',
    description: 'Memory nodes (MEMs) in which to allow execution (0-3, 0,1).'
  },
  cpuQuota: {
    type: 'integer',
    label: 'CPU Quota',
    min: 0,
    description: "100 000 means 100% of 1 CPU. 0 also means 100% of 1 CPU."
  },
  cpuShares: {
    type: 'integer',
    label: 'CPU Shares',
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
const NETWORK_FIELDS = {
  publishAllPorts: {
    type: 'boolean',
    label: 'Publish All Ports'
  },
  hostname: {
    type: 'string',
    label: 'Hostname'
  }
};

const CPU_FIELDS_KEYS = Object.keys(CPU_FIELDS);
const NETWORK_FIELDS_KEYS = Object.keys(NETWORK_FIELDS);

@connect(state => ({
  clusters: state.clusters,
  containers: state.containers,
  containersUI: state.containersUI,
  images: state.images
}), {create, loadNodes, loadImages, loadImageTags, searchImages,
  loadContainers, loadDefaultParams, loadDetails})
@reduxForm({
  form: 'newContainer',
  fields: ['image', 'tag', 'name', 'node', 'registry', 'restart', 'restartRetries', 'dns', 'dnsSearch']
    .concat(CPU_FIELDS_KEYS, NETWORK_FIELDS_KEYS)
})
export default class ContainerCreate extends Component {
  static propTypes = {
    clusters: PropTypes.object.isRequired,
    containers: PropTypes.object.isRequired,
    containersUI: PropTypes.object.isRequired,
    images: PropTypes.object.isRequired,
    cluster: PropTypes.object.isRequired,
    createError: PropTypes.string,
    fields: PropTypes.object.isRequired,
    origin: PropTypes.object,
    handleSubmit: PropTypes.func,
    resetForm: PropTypes.func.isRequired,
    loadContainers: PropTypes.func.isRequired,
    loadDefaultParams: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    loadNodes: PropTypes.func.isRequired,
    loadImages: PropTypes.func.isRequired,
    loadImageTags: PropTypes.func.isRequired,
    searchImages: PropTypes.func.isRequired,
    create: PropTypes.func.isRequired,
    loadDetails: PropTypes.func.isRequired
  };

  constructor(...params) {
    super(...params);
    this.state = {
      dns: [],
      dnsSearch: [],
      ports: [{field1: '', field2: ''}],
      links: [{field1: '', field2: ''}],
      volumeBinds: [""],
      volumesFrom: [""],
      environment: [{field1: '', field2: ''}],
      constraints: [""],
      affinity: [""],
      command: [""],
      entrypoint: [""],
      selectImageValue: {value: '', label: ''},
      checkboxes: {checkboxInitial: ''},
      creationLogVisible: '',
      selectMenuVisible: false,
      loadingParams: false
    };
  }

  componentWillMount() {
    const {loadNodes, loadImages, cluster, fields, origin} = this.props;

    fields.restart.value = 'no';
    fields.publishAllPorts.value = 'false';
    _.each(fields, function loopFields(value, key) {
      if (CPU_FIELDS[key] && CPU_FIELDS[key].defaultValue) {
        fields[key].onChange(CPU_FIELDS[key].defaultValue);
      }
    });
    if (origin) {
      this.setOriginParams();
    }
    loadNodes(cluster.name);
    loadImages();
  }

  setOriginParams() {
    const {fields, loadDetails, origin} = this.props;
    let registryImage = '';
    let tag = '';
    this.setState({loadingParams: true});
    loadDetails(origin).then((originParams) => {
      _.forOwn(originParams, (value, key) => {
        this.setDefaultFields(originParams, value, key, fields);
      });
      if (typeof(originParams.image) === 'string') {
        let imageValSplitted = this.splitImageTag(originParams.image);
        if (imageValSplitted.length === 2) {
          tag = imageValSplitted[1];
        }
        registryImage = imageValSplitted[0];
        this.updateImageValue({value: registryImage});
        if (!_.isEmpty(tag)) {
          this.updateTagValue(tag);
        }
      }
      this.setState({loadingParams: false});
    }).catch(()=>this.setState({loadingParams: false}));
  }

  splitImageTag(image) {
    let result = [];
    let imageValSplitted = image.split(':');
    result.push(imageValSplitted[0]);
    if (imageValSplitted.length === 2) {
      result.push(imageValSplitted[1]);
    }
    return result;
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
    const {cluster, origin} = this.props;
    if (origin) {
      const imageNoTag = this.splitImageTag(origin.image)[0];
      callback(null, {options: [{value: imageNoTag, label: imageNoTag}]});
    } else {
      let options = [];
      let registriesArr = _.get(cluster, 'config.registries', []).map(function listRegistries(element) {
        let checkBoxState = this.state.checkboxes[element];
        if (checkBoxState && checkBoxState.checked === true) {
          return element;
        }
      }.bind(this)).filter((element)=> {
        return typeof(element) !== 'undefined';
      });
      let registries = registriesArr.join(', ');
      if (input.length > 0) {
        this.props.dispatch(searchImages(input, 10, 100, registries, cluster.name)).then(() => {
          let results = this.props.images.search.results;
          for (let i = 0; i < results.length; i++) {
            let imageName = results[i].name;
            options.push({value: imageName, label: imageName});
          }
        }).then(()=> {
          callback(null, {options: options});
        });
      } else {
        callback(null, options = {value: '', label: ''});
      }
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
    let ValSplitted = this.splitImageRegistry(newValue.value);
    registry = ValSplitted.registry;
    image = ValSplitted.image;
    fields.registry.onChange(registry);
    fields.image.onChange(image);
  }

  updateTagValue(newValue) {
    const {fields, origin} = this.props;
    this.setState({
      selectTagValue: newValue
    });
    if (!origin) {
      this.onTagChange(newValue);
    }
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

  renderSelectValue(option) {
    return <Label bsStyle="info">{option.label}</Label>;
  }

  onSelectMenuOpen() {
    this.setState({
      selectMenuVisible: true
    });
  }

  onSelectMenuClose() {
    setTimeout(function changeMenuState() {
      this.setState({selectMenuVisible: false});
    }.bind(this), 500);
  }

  dnsOnChange(fieldName, value) {
    let vals = [];
    const fields = this.props.fields;
    this.setState({[fieldName]: value});
    value.map((el) => {
      vals.push(el.value);
    });
    fields[fieldName].onChange(vals);
  }

  getDnsLabel(label) {
    return 'Add "' + label + '"';
  }

  render() {
    require('./ContainerCreate.scss');
    require('react-select/dist/react-select.css');
    const {clusters, cluster, fields, containers, origin} = this.props;
    const originImage = origin ? this.splitImageTag(origin.image)[0] : '';
    let clusterRegistries = _.get(cluster, 'config.registries', []);
    let containersNames = [];
    _.forEach(containers, (container) => {
      containersNames.push(container.name);
    });
    const dnsValue = this.state.dns;
    const dnsSearchValue = this.state.dnsSearch;
    const creationLogVisible = this.state.creationLogVisible;
    let clusterDetailed = clusters[cluster.name];// to ensure loading of nodes with loadNodes;
    let nodes = clusterDetailed.nodesList;
    nodes = nodes ? nodes : [];
    let field;
    let image = this.getCurrentImage();
    const selectMenuVisible = this.state.selectMenuVisible;

    return (
      <Dialog show
              size="large"
              title="Create Container"
              onSubmit={this.props.handleSubmit(this.onSubmit.bind(this))}
              onHide={this.props.onHide}
              okTitle={creationLogVisible ? "Again" : "Create Container"}
              cancelTitle={creationLogVisible ? "Close" : null}
              keyboard={!selectMenuVisible}
              backdrop="static"
              showSpinner={this.state.loadingParams}
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
                            onOpen={this.onSelectMenuOpen.bind(this)}
                            onClose={this.onSelectMenuClose.bind(this)}
                            className="imageSelect"
                            minimumInput={ 1 }
                            value={origin ? originImage : this.state.selectImageValue}
                            disabled={origin ? true : false}
                            autoload
                            cache={false}
                            placeholder = "Search..."
                            valueRenderer={this.renderSelectValue}
                            resetValue = ""
                            onChange={this.updateImageValue.bind(this)}
                            searchable={this.state.searchable} />
            </div>
            <div className="button-wrapper">
            <button className = "btn btn-default btn-sm react-select-button" disabled={clusterRegistries.length === 0} type="button" onClick={this.displayRegistries.bind(this)}>Select From Custom Registry</button>
            </div>
            <div className="checkbox-list checkbox-list-image">
              {
                clusterRegistries.map(function list(registry, i) {
                  if (typeof(registry) !== 'undefined') {
                    return (<div className="checkbox-button" key={i}><label>
                               <input type="checkbox"
                                      className="checkbox-control registry-checkbox"
                                      value={registry}
                                      defaultChecked={false}
                                      onChange={this.toggleCheckbox.bind(this)}
                                      name={registry}
                                     />
                               <span className="checkbox-label">{registry || "Docker Hub"}</span>
                            </label></div>);
                  }
                }.bind(this))
              }
            </div>

            <div className="form-group">
              <label>Tag:</label>
              <Select ref="tagSelect"
                      className="tagSelect"
                      simpleValue
                      clearable
                      onOpen={this.onSelectMenuOpen.bind(this)}
                      onClose={this.onSelectMenuClose.bind(this)}
                      valueRenderer={this.renderSelectValue}
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
            <div className="form-group">
              <label>Container Name:</label>
              {fields.name.error && fields.name.touched && <div className="text-danger">{fields.name.error}</div>}
              <input type="text" {...fields.name} className="form-control"/>
            </div>
            <Accordion className="accordion-create-container">
              <Panel header="Environment Variables and Entrypoints" eventKey="1">
                {this.doubleInputField('environment', 'Environment')}
                {this.oneInputField('constraints', 'Constraints')}
                {this.oneInputField('affinity', 'Affinity')}
                {this.oneInputField('command', 'Command')}
                {this.oneInputField('entrypoint', 'Entry Point')}
              </Panel>
              <Panel header="Runtime Constraints" eventKey="2">
                <div className="row">
                  {CPU_FIELDS_KEYS.map(key =>
                    <div className="col-md-6" key={key}>
                      {fieldComponent(key)}
                    </div>
                  )}
                </div>
              </Panel>
              <Panel header="Volume Settings" eventKey="3">
                {this.oneInputField('volumeBinds', 'Volume Binds', 'host-src:container-dest[:<options>]')}
                {this.oneInputField('volumesFrom', 'Volumes From', "container:['rw'|'ro']")}
              </Panel>
              <Panel header="Network Settings" eventKey="4">
                {this.doubleInputField('ports', 'Ports', 'Public Port', 'Private Port')}
                <div className="row">
                  {NETWORK_FIELDS_KEYS.map(key =>
                    <div className="col-sm-6" key={key}>
                      {fieldComponent(key)}
                    </div>
                  )}
                  <div className="col-sm-6">
                    <label>DNS:</label>
                    <Select.Creatable
                      multi
                      noResultsText=""
                      placeholder="Enter DNS address"
                      onChange={this.dnsOnChange.bind(this, "dns")}
                      value={dnsValue}
                      promptTextCreator={this.getDnsLabel}
                    />
                  </div>
                  <div className="col-sm-6">
                    <label>DNS Search:</label>
                    <Select.Creatable
                      multi
                      noResultsText=""
                      placeholder="Enter domain name"
                      onChange={this.dnsOnChange.bind(this, "dnsSearch")}
                      value={dnsSearchValue}
                      promptTextCreator={this.getDnsLabel}
                    />
                    <small className="text-muted">Sets the domain names that are searched when a bare unqualified hostname isused inside of the container.</small>
                  </div>
                </div>
              </Panel>
            </Accordion>
            {this.fieldRestart()}
            <div className="form-group" id="creation-log-block">
              <label>Create Log: <i className="fa fa-spinner fa-2x fa-pulse"/></label>
              <textarea readOnly
                        className="container-creation-log"
                        defaultValue="Creating Container..."
                        id="creation-log"
              />
            </div>
          </form>
      </Dialog>
    );

    function fieldComponent(name) {
      let property = CPU_FIELDS[name] || NETWORK_FIELDS[name];
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
        case 'boolean':
          return inputBinarySelect(property, field);
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

    function inputBinarySelect(property, field) {
      return (<select className="form-control" {...field}>
          <option key="no" value="false">no</option>
          <option key="yes" value="true">yes</option>
      </select>);
    }
  }

  getCurrentImage() {
    const {images} = this.props;
    let imageName = this.state.selectImageValue.value;
    if (!imageName) {
      return null;
    }
    let image = null;
    _.forOwn(images, register => {
      if (register && register[imageName]) {
        image = register[imageName];
      }
    });
    return image;
  }

  onImageChange(value) {
    const {loadImageTags} = this.props;
    if (value) {
      this.setState({loadingParams: true});
      loadImageTags(value).then(()=>this.setState({loadingParams: false}))
        .catch(()=>this.setState({loadingParams: false}));
    }
  }

  splitImageRegistry(value) {
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
    let imageFullName = registry ? registry + '/' + image : image;
    let tag = value;
    if (tag && image) {
      this.setState({loadingParams: true});
      loadDefaultParams({clusterId: cluster.name, image: imageFullName, tag})
        .then((defaultParams) => {
          _.forOwn(defaultParams, (value, key) => {
            this.setDefaultFields(defaultParams, value, key, fields);
          });
          this.setState({loadingParams: false});
        }).catch(()=>this.setState({loadingParams: false}));
    }
  }

  setDefaultFields(defaultParams, value, key, fields) {
    if (['tag'].indexOf(key) > -1) return;
    if (key === 'environment') {
      let envVars = {};
      envVars.environment = [];
      envVars.affinity = [];
      envVars.constraints = [];
      defaultParams.environment.map((item, key) => {
        if (item.substring(0, 11) === 'constraint:') {
          envVars.constraints.push(item.substring(11));
        } else if (item.substring(0, 9) === 'affinity:') {
          envVars.affinity.push(item.substring(9));
        } else {
          let envParts = item.split(/=(.+)/);
          let firstPart = envParts[0];
          let secondPart = envParts[1];
          envVars.environment = [...envVars.environment, {field1: firstPart, field2: secondPart}];
        }
      });
      this.setEnvironment(envVars);
    }
    if (key === 'ports') {
      let ports = [];
      _.map(defaultParams.ports, (item, key) => {
        ports = [...ports, {field1: key, field2: item}];
      });
      if (ports.length > 0) {
        this.setState({
          ports: ports
        });
      }
    }
    if (key === 'command' || key === 'entrypoint') {
      if (value.length > 0) {
        this.setState({
          [key]: value
        });
      }
    }
    if (key === 'volumeBinds' || key === 'volumesFrom') {
      let volumes = [];
      _.map(defaultParams[key], (item, key) => {
        volumes = [...volumes, item];
      });
      if (volumes.length > 0) {
        this.setState({
          [key]: volumes
        });
      }
    }
    if (fields[key] !== undefined && !fields[key].value) {
      if (key === 'memoryLimit' && value) {
        let result = value.replace(/TiB|GiB|MiB|KiB/gi, match=> {
          return match[0].toLowerCase();
        });
        fields[key].onChange(result);
      } else {
        fields[key].onChange(value);
      }
    }
  }

  setEnvironment(defaultEnv) {
    _.forOwn(defaultEnv, (value, key)=> {
      if (!_.isEmpty(defaultEnv[key])) {
        this.setState({
          [key]: value
        });
      }
    });
  }

  onSubmit() {
    this.create();
  }

  create() {
    const {fields, create, cluster, resetForm, loadContainers} = this.props;
    let container = {
      cluster: cluster.name
    };
    let fieldNames = ['node', 'name', 'dns', 'dnsSearch'].concat(CPU_FIELDS_KEYS, NETWORK_FIELDS_KEYS);
    fieldNames.forEach(key => {
      let value = fields[key].value;
      if (value) {
        container[key] = value;
      }
    });
    let registry = fields.registry.value ? fields.registry.value + '/' : '';
    let tag = fields.tag.value ? ':' + fields.tag.value : '';
    container.image = $.trim(registry + fields.image.value + tag);
    let $logBlock = $('#creation-log-block');
    let $spinner = $logBlock.find('i');
    container.ports = this.getPorts();
    container.environment = this.getEnvironmentFields();
    container.restart = this.getRestart();
    container.volumesFrom = this.getOneInputField('volumesFrom');
    container.volumeBinds = this.getOneInputField('volumeBinds');
    container.command = this.getOneInputField('command');
    container.entrypoint = this.getOneInputField('entrypoint');
    $logBlock.show();
    this.setState({
      creationLogVisible: true
    });
    $spinner.show();
    return create(container)
      .then((response) => {
        let msg = (response._res.text && response._res.text.length > 0) ? response._res.text : "No response message";
        $('#creation-log').val(msg);
        $spinner.hide();
        fields.name.onChange('');
        return loadContainers(cluster.name);
      })
      .catch((response) => {
        $spinner.hide();
        throw new SubmissionError(response.message);
      });
  }

  doubleInputField(fieldName, label, placeholder1 = "", placeholder2 = "" ) {
    let items = this.state[fieldName];
    return (
      <div className={"form-group " + "field-" + fieldName}>
        {this.iconPlus(fieldName, label, addItem)}
        <div className="field-body">
          {items.map((item, key) => <div className="row" key={key}>
            <div className="col-sm-6">
              <input type="string" onChange={handleChange.bind(this, fieldName, key, 'field1')} className="form-control"
                     placeholder={placeholder1} value={this.state[fieldName][key].field1}/>
            </div>
            <div className="col-sm-6 preIcon">
              <input type="string" onChange={handleChange.bind(this, fieldName, key, 'field2')} className="form-control"
                     placeholder={placeholder2} value={this.state[fieldName][key].field2}/>
              {key > 0 && this.iconMinus(fieldName, key)}
            </div>
          </div>)}
        </div>
      </div>
    );

    function handleChange(fieldName, i, type, event) {
      let state = Object.assign({}, this.state);
      state[fieldName][i][type] = event.target.value;
      this.setState(state);
    }

    function addItem(fieldName) {
      this.setState({
        ...this.state,
        [fieldName]: [...this.state[fieldName], {field1: '', field2: ''}]
      });
    }
  }

  iconMinus(fieldName, key) {
    return (
      <div className="iconContainer">
        <a className="minus-icon" onClick={this.deleteField.bind(this, fieldName, key)}><i
          className="fa fa-minus-circle"/></a>
      </div>
    );
  }

  iconPlus(fieldName, label, addItem) {
    return (
      <div className="field-header">
        <label>{label}</label>
        <a onClick={addItem.bind(this, fieldName)}><i className="fa fa-plus-circle"/></a>
      </div>
    );
  }

  oneInputField(fieldName, label, placeholder = "") {
    let items = this.state[fieldName];
    return (
      <div className={"form-group " + "field-" + fieldName}>
        {this.iconPlus(fieldName, label, addItem)}
        <div className="field-body">
          {items.map((item, key) => <div className="row" key={key}>
            <div className="col-sm-12 preIcon">
              <input type="text" onChange={handleChange.bind(this, key, fieldName)} value={this.state[fieldName][key]}
                     className="form-control"
                     placeholder={placeholder}/>
              {key > 0 && this.iconMinus(fieldName, key)}
            </div>
          </div>)}
        </div>
      </div>
    );

    function handleChange(i, fieldName, event) {
      let state = Object.assign({}, this.state);
      state[fieldName][i] = event.target.value;
      this.setState(state);
    }

    function addItem(fieldName) {
      this.setState({
        ...this.state,
        [fieldName]: [...this.state[fieldName], ""]
      });
    }
  }

  deleteField(fieldName, key) {
    let state = Object.assign({}, this.state);
    state[fieldName].splice(key, 1);
    this.setState(state);
  }

  getEnvironmentFields() {
    let envVars = this.state.environment;
    let constrVars = this.state.constraints;
    let affVars = this.state.affinity;
    let environment = [];
    envVars.forEach(item => {
      if (item.field1 && item.field2) {
        environment.push(item.field1 + '=' + item.field2);
      }
    });
    constrVars.forEach(item => {
      if (item) {
        environment.push('constraint:' + item);
      }
    });
    affVars.forEach(item => {
      if (item) {
        environment.push('affinity:' + item);
      }
    });
    return environment;
  }

  getPorts() {
    return this.getMapField('ports');
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

  getOneInputField(fieldName) {
    let list = this.state[fieldName];
    let provedList = [];
    list.forEach(item => {
      if (item.length > 0) {
        provedList.push(item);
      }
    });
    return provedList;
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
      value += `:${restartRetries.value}`;
    }
    return value;
  }
}

