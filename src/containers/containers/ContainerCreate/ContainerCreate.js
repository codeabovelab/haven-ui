import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {reduxForm} from 'redux-form';
import {create} from 'redux/modules/containers/containers';
import {loadNodes, loadContainers, loadDefaultParams} from 'redux/modules/clusters/clusters';
import {loadImages, loadImageTags} from 'redux/modules/images/images';
import _ from 'lodash';

const EXTRA_FIELDS = {
  containerName: {
    label: 'Container name'
  },
  restart: {
    label: 'Restart police'
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
  images: state.images
}), {create, loadNodes, loadImages, loadImageTags, loadContainers, loadDefaultParams})
@reduxForm({
  form: 'newContainer',
  fields: ['image', 'tag', 'node'].concat(EXTRA_FIELDS_KEYS)
})
export default class ContainerCreate extends Component {
  static propTypes = {
    clusters: PropTypes.object.isRequired,
    containersUI: PropTypes.object.isRequired,
    images: PropTypes.object.isRequired,
    cluster: PropTypes.object.isRequired,
    create: PropTypes.func.isRequired,
    loadNodes: PropTypes.func.isRequired,
    loadImages: PropTypes.func.isRequired,
    loadImageTags: PropTypes.func.isRequired,
    fields: PropTypes.object.isRequired,
    resetForm: PropTypes.func.isRequired,
    loadContainers: PropTypes.func.isRequired,
    loadDefaultParams: PropTypes.func.isRequired
  };
  static focusSelector = '#image-select';

  componentWillMount() {
    const {loadNodes, loadImages, cluster} = this.props;
    loadNodes(cluster.name);
    loadImages();
  }

  getImagesList() {
    let imagesList = [];
    const {images} = this.props;
    Object.keys(images).forEach(registerName => {
      let register = images[registerName];
      _.forOwn(register, image => {
        let i = Object.assign({}, image, {label: `${registerName} | ${image.name}`});
        imagesList.push(i);
      });
    });
    return imagesList;
  }

  render() {
    const {clusters, cluster, fields, containersUI} = this.props;
    let clusterDetailed = clusters[cluster.name];// to ensure loading of nodes with loadNodes;
    let nodes = clusterDetailed.nodesList;
    nodes = nodes ? nodes : [];
    let imagesList = this.getImagesList();
    let field;
    let image = this.getCurrentImage();
    let creating = containersUI.new.creating;
    return (
      <div className="modal-content">
        <div className="modal-header">
          <button type="button" className="close" data-dismiss="modal">
            <span aria-hidden="true">&times;</span>
          </button>
          <h4 className="modal-title">Create Container
            {creating && <span>{' '}<i className="fa fa-spinner fa fa-pulse"/></span>}
          </h4>
        </div>
        <div className="modal-body">
          <form>
            <div className="form-group" required>
              {(field = fields.image) && ''}
              <label>Image:</label>
              <select id={ContainerCreate.focusSelector.replace('#', '')} className="form-control" {...field}
                      onChange={e => {fields.image.onChange(e); this.onImageChange.call(this, e);}}>
                <option disabled/>
                {imagesList && imagesList.map(image =>
                  <option key={image.label} value={image.name} data-register={image.register}>{image.label}</option>
                )}
              </select>
            </div>
            <div className="form-group">
              <label>Tag:</label>
              {(field = fields.tag) && ''}
              <select className="form-control" {...field}
                      onChange={e => {fields.tag.onChange(e); this.onTagChange.call(this, e);}}>
                <option />
                {image && image.tags && image.tags.map(tag =>
                  <option key={tag} value={tag}>{tag}</option>
                )}
              </select>
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
            <div className="row">
              {EXTRA_FIELDS_KEYS.map(key =>
                <div className="col-md-6" key={key}>
                  {fieldComponent(key)}
                </div>
              )}
            </div>
          </form>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={this.create.bind(this)} disabled={creating}>
            Create
          </button>
        </div>
      </div>
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
    let imageName = fields.image.value;
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

  onImageChange(event) {
    const {loadImageTags} = this.props;
    let option = event.target[event.target.selectedIndex];
    let register = option.dataset.register;
    if (register) {
      loadImageTags({register, image: event.target.value});
    }
  }

  onTagChange(event) {
    const {cluster, loadDefaultParams, fields} = this.props;
    let image = fields.image.value;
    let tag = event.target.value;
    if (tag && image) {
      loadDefaultParams({clusterId: cluster.name, image, tag})
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

  create() {
    const {fields, create, cluster, resetForm, loadContainers} = this.props;
    let container = {
      cluster: cluster.name
    };

    Object.keys(fields).forEach(key => {
      let value = fields[key].value;
      if (value) {
        container[key] = value;
      }
    });
    return create(container)
      .then(() => {
        resetForm();
        window.simpleModal.close();
        return loadContainers(cluster.name);
      })
      .catch();
  }
}
