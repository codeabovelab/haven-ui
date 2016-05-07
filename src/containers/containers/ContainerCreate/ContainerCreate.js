import React, {Component, PropTypes} from 'react';
import * as containerActions from 'redux/modules/containers/containers';
import {connect} from 'react-redux';
import {reduxForm} from 'redux-form';
import {create} from 'redux/modules/containers/containers';
import {loadNodes, loadContainers} from 'redux/modules/clusters/clusters';
import {loadImages, loadImageTags} from 'redux/modules/images/images';
import _ from 'lodash';

const EXTRA_FIELDS = {
  containerName: {
    label: 'Container name'
  },
  restart: {
    label: 'Restart police'
  },
  memory: {
    label: 'Memory Limit'
  },
  cpuQuota: {
    type: 'number',
    label: 'CPU Quota'
  },
  cpuShares: {
    type: 'number',
    label: 'CPU Shares'
  },
  blkioWeight: {
    type: 'number',
    label: 'Blkio'
  }
};
const EXTRA_FIELDS_KEYS = Object.keys(EXTRA_FIELDS);

@connect(state => ({
  clusters: state.clusters,
  images: state.images
}), {create, loadNodes, loadImages, loadImageTags, loadContainers})
@reduxForm({
  form: 'newContainer',
  fields: ['image', 'tag', 'node'].concat(EXTRA_FIELDS_KEYS)
})
export default class ContainerCreate extends Component {
  static propTypes = {
    clusters: PropTypes.object.isRequired,
    images: PropTypes.object.isRequired,
    cluster: PropTypes.object.isRequired,
    create: PropTypes.func.isRequired,
    loadNodes: PropTypes.func.isRequired,
    loadImages: PropTypes.func.isRequired,
    loadImageTags: PropTypes.func.isRequired,
    fields: PropTypes.object.isRequired,
    resetForm: PropTypes.func.isRequired,
    loadContainers: PropTypes.func.isRequired
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
    const {clusters, cluster, fields} = this.props;
    let clusterDetailed = clusters[cluster.name];// to ensure loading of nodes with loadNodes;
    let nodes = clusterDetailed.nodesList;
    nodes = nodes ? nodes : [];
    let imagesList = this.getImagesList();
    let field;
    let image = this.getCurrentImage();
    return (
      <div className="modal-content">
        <div className="modal-header">
          <button type="button" className="close" data-dismiss="modal">
            <span aria-hidden="true">&times;</span>
          </button>
          <h4 className="modal-title">Create Container</h4>
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
              <select className="form-control" {...field}>
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
          <button type="button" className="btn btn-primary" onClick={this.create.bind(this)}>Create</button>
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
          <input type="text" {...field} className="form-control"/>
        </div>
      );
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

  onOk() {
    return this.create();
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
