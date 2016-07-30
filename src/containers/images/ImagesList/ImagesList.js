import React, {Component, PropTypes} from 'react';
import {loadImages} from 'redux/modules/images/images';
import {load as loadRegistries} from 'redux/modules/registries/registries';
import {connect} from 'react-redux';
import {DockTable, StatisticsPanel} from '../../../components/index';
import {RegisterEdit} from '../../index';
import {Label, Badge, ButtonToolbar, SplitButton, MenuItem} from 'react-bootstrap';
import _ from 'lodash';

const COLUMNS = [
  {
    name: 'registry',
    label: 'Registry Address',
    width: '40%',
    sortable: true
  },
  {
    name: 'name',
    label: 'Name',
    width: '35%',
    sortable: true
  },
  {
    name: 'tags',
    label: 'Tags',
    width: '15%',
    render: tagsRender
  },
  {
    name: 'Actions',
    width: '10%',
    render: actionsRender
  }
];

const GROUP_BY_SELECT = ['registry', 'name'];

@connect(
  state => ({
    images: state.images,
    imagesUI: state.imagesUI,
    registries: state.registries,
    registriesUI: state.registriesUI
  }), {loadImages, loadRegistries})

export default class ImagesList extends Component {
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

    let rows = this.props.images.all;
    let showLoading = false;
    let showError = false;
    let showData = false;
    let runningImages = 0;

    if (rows && rows.length > 0) {
      rows.forEach((image) => {
        runningImages++;
      });
    }
    if (loadingError) {
      showError = true;
    } else if (loading && (!rows || rows.length === 0)) {
      showLoading = true;
    } else {
      showData = true;
    }

    return (
      <div>
        <StatisticsPanel metrics={this.statisticsMetrics}
        values={[runningImages]}
        />
        <div className="panel">
          <div className="panel-body">
            <div className="panel-content">
              {showLoading && (
                <div className="text-xs-center">
                  <i className="fa fa-spinner fa-pulse fa-5x"/>
                  <h5>Loading...</h5>
                </div>
              )}

              {showData && (
                <div>
                  {rows && rows.length > 0 && (
                    <div>
                      <div className="containers">
                        <DockTable columns={COLUMNS}
                                   rows={rows}
                                   groupBy="registry"
                                   groupBySelect={GROUP_BY_SELECT} />
                      </div>
                    </div>
                  )}

                  {rows && rows.length === 0 && (
                    <div className="alert alert-info">
                      No images yet
                    </div>
                  )}
                </div>
              )}

              {showError && (
                <div className="alert alert-danger">{loadingError}</div>
              )}
            </div>
          </div>
        </div>
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

function tagsRender(image) {
  return (
    <td key="tags">
      {image.tags.map((tag) => {
        return (
          <Label bsStyle="info">{tag}</Label>
        );
      })}
    </td>
  );
}

function actionsRender() {
  return (
    <td key="actions" className="td-actions">
    <ButtonToolbar bsStyle="default">
    <SplitButton bsStyle="info" title="Info">
    <MenuItem eventKey="1">Information</MenuItem>
    <MenuItem divider />
    <MenuItem eventKey="2">Delete</MenuItem>
    </SplitButton>
    </ButtonToolbar>
    </td>
);
}
