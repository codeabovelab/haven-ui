import React, {Component, PropTypes} from 'react';
import {loadImages} from 'redux/modules/images/images';
import {load as loadRegistries} from 'redux/modules/registries/registries';
import {connect} from 'react-redux';
import {DockTable, ImagesList, StatisticsPanel} from '../../../components/index';
import {RegisterEdit} from '../../index';
import {Label, Badge, ButtonToolbar, SplitButton, MenuItem} from 'react-bootstrap';
import _ from 'lodash';

@connect(
  state => ({
    images: state.images,
    imagesUI: state.imagesUI,
    registries: state.registries,
    registriesUI: state.registriesUI
  }), {loadImages, loadRegistries})

export default class ImagesPanel extends Component {
  static propTypes = {
    images: PropTypes.object.isRequired,
    imagesUI: PropTypes.object.isRequired,
    registries: PropTypes.array.isRequired,
    registriesUI: PropTypes.object.isRequired,
    loadImages: PropTypes.func.isRequired,
    loadRegistries: PropTypes.func.isRequired
  };

  statisticsMetrics = [
    {
      type: 'number',
      title: 'Images Running'
    }
  ];

  componentDidMount() {
    const {loadImages, loadRegistries} = this.props;

    loadImages();
    loadRegistries();

    $('.input-search').focus();
  }

  render() {
    const {loading, loadingError} = this.props.imagesUI;
    const {registries, registriesUI} = this.props;

    let imagesList = this.props.images.all;

    let runningImages = 0;

    if (imagesList && imagesList.length > 0) {
      imagesList.forEach((image) => {
        runningImages++;
      });
    }
    return (
      <div>
        <StatisticsPanel metrics={this.statisticsMetrics}
                        values={[runningImages]}
        />
        <ImagesList loading={typeof imagesList === "undefined"}
                    data={imagesList}
        />
      </div>
    );
  }

  addRegister() {
    let contentComponent = <RegisterEdit/>;
    window.simpleModal.show({
      contentComponent,
      focus: RegisterEdit.focusSelector
    });
  }
}
