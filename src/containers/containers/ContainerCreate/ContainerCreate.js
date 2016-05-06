import React, {Component, PropTypes} from 'react';
import * as containerActions from 'redux/modules/containers/containers';
import {connect} from 'react-redux';
import {reduxForm} from 'redux-form';
import {create} from 'redux/modules/containers/containers';
import {loadNodes} from 'redux/modules/clusters/clusters';
import {loadImages} from 'redux/modules/images/images';

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
}), {create, loadNodes, loadImages})
@reduxForm({
  form: 'newContainer',
  fields: ['image', 'node'].concat(EXTRA_FIELDS_KEYS)
})
export default class ContainerCreate extends Component {
  static propTypes = {
    clusters: PropTypes.object.isRequired,
    images: PropTypes.object.isRequired,
    cluster: PropTypes.object.isRequired,
    create: PropTypes.func.isRequired,
    loadNodes: PropTypes.func.isRequired,
    loadImages: PropTypes.func.isRequired,
    fields: PropTypes.object.isRequired,
    resetForm: PropTypes.func.isRequired
  };

  componentWillMount() {
    const {loadNodes, loadImages, cluster} = this.props;
    loadNodes(cluster.name);
    loadImages();
  }

  componentDidMount() {
    this.refs.image.focus();//not working because wrapped in modal window
  }

  getImagesList() {
    let imagesList = [];
    const {images} = this.props;
    Object.keys(images).forEach(register => {
      let items = images[register];
      items.forEach(image => {
        let i = Object.assign({}, image, {label: `${register} | ${image.name}`});
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
              <select ref="image" className="form-control" {...field}>
                <option disabled/>
                {imagesList && imagesList.map(image =>
                  <option key={image.label} value={image.name}>{image.label}</option>
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

  onOk() {
    return this.create();
  }

  create() {
    const {fields, create, cluster, resetForm} = this.props;
    let container = {
      cluster: cluster.name,
      image: fields.image.value,
      node: fields.node.value
    };
    return create(container)
      .then(() => {
        resetForm();
        //return load();
      })
      .catch();
  }
}
