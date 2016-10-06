import React, {Component, PropTypes} from 'react';
import {loadImages} from 'redux/modules/images/images';
import {deleteImages} from 'redux/modules/images/images';
import {connect} from 'react-redux';
import {DockTable, ImagesList, StatisticsPanel} from '../../../components/index';
import {RegistryEdit} from '../../index';
import {Label, Badge, ButtonToolbar, SplitButton, MenuItem} from 'react-bootstrap';
import _ from 'lodash';

@connect(
  state => ({
    images: state.images,
    imagesUI: state.imagesUI,
    registries: state.registries,
    registriesUI: state.registriesUI
  }), {loadImages, deleteImages})

export default class ImagesPanel extends Component {
  static propTypes = {
    images: PropTypes.object.isRequired,
    imagesUI: PropTypes.object.isRequired,
    registries: PropTypes.array.isRequired,
    registriesUI: PropTypes.object.isRequired,
    loadImages: PropTypes.func.isRequired,
    deleteImages: PropTypes.func.isRequired
  };

  statisticsMetrics = [
    {
      type: 'number',
      title: 'Image available',
      titles: 'Images available',
    },
    {
      type: 'number',
      title: 'Image Running',
      titles: 'Images Running',
    }
  ];

  componentDidMount() {
    const {loadImages} = this.props;

    loadImages();

    $('.input-search').focus();
  }

  render() {
    const {loading, loadingError} = this.props.imagesUI;
    const {registries, registriesUI} = this.props;

    let imagesList = this.props.images.all;

    let runningImages = 0;
    let availableImages = 0;

    if (imagesList && imagesList.length > 0) {
      imagesList.forEach((image) => {
        availableImages++;
        if (image.nodes && image.nodes.length > 0) {
          runningImages++;
        }
      });
    }
    let actions = {
      list: [
        {key: "delFromNodes", title: (<span>Delete<br/><small>from nodes</small></span>)},
        {key: "delFromAll", title: (<span>Delete<br/><small>from everywhere</small></span>)},
        {key: "delFromAllExceptLast", title: (<span>Delete<br/><small>from everywhere except last</small></span>)}
      ],
      handler: this.onActionInvoke.bind(this)
    };
    return (
      <div>
        <StatisticsPanel metrics={this.statisticsMetrics}
                        values={[availableImages, runningImages]}
        />
        <ImagesList loading={!imagesList}
                    data={imagesList}
                    actions={actions}
        />
      </div>
    );
  }

  onActionInvoke(type, image) {
    let startDeleteImage = (arg) => {
      confirm('Are you sure you want to remove image:' + image.name + ' ?')
        .then(() => {
          this.props.deleteImages({
            ...arg,
            nodes: image.nodes,
            name: image.name
          });
          //TODO reload images
        });
    };
    switch (type) {
      case "delFromNodes":
        startDeleteImage();
        break;
      case "delFromAll":
        startDeleteImage({fromRegistry: true});
        break;
      case "delFromAllExceptLast":
        startDeleteImage({fromRegistry: true, retainLast: 2/*'last' and prev. tag*/});
        break;
      default:
        break;
    }
  }
}
