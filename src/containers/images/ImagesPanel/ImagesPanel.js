import React, {Component, PropTypes} from 'react';
import {loadImages} from 'redux/modules/images/images';
import {deleteImages} from 'redux/modules/images/images';
import {connect} from 'react-redux';
import {ImagesList, StatisticsPanel} from '../../../components/index';
import {Button} from 'react-bootstrap';
import Helmet from 'react-helmet';

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
        <Helmet title="Images"/>
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
    let startDeleteImage = (argi) => {
      let arg = argi || {};
      arg.dryRun = true;
      let dlgRender = (dlg) => {
        let toggleDryRun = () => {
          arg.dryRun = !arg.dryRun;
          // it need for refresh dlg view
          dlg.setState(arg);
        };
        return (<span>
          <p>Are you sure you want to remove image:{image.name} ?</p>
          <Button active={arg.dryRun} bsStyle="danger" onClick={toggleDryRun}>
            Dry run
          </Button>
          </span>);
      };
      confirm(dlgRender).then(() => {
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
