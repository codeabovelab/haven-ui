import React, {Component, PropTypes} from 'react';
import {loadImages} from 'redux/modules/images/images';
import {load as loadRegistries} from 'redux/modules/registries/registries';
import {connect} from 'react-redux';
import {DockTable} from '../../../components/index';
import {RegisterEdit} from '../../index';
import _ from 'lodash';

const COLUMNS = [
  {
    name: 'registry',
    label: 'Registry',
    sortable: true
  },
  {
    name: 'name',
    label: 'Name',
    sortable: true
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
    if (loadingError) {
      showError = true;
    } else if (loading && (!rows || rows.length === 0)) {
      showLoading = true;
    } else {
      showData = true;
    }

    return (
      <div className="panel">
        <div className="panel-body">
          <div className="panel-content">
            <div className="page-info-group">
              <div>
                <label># of Images:</label>
                <value>{rows.length}</value>
              </div>
              <div>
                <label># of Registries:</label>
                <value>{registriesUI.loaded && <span>{registries.length}</span>}</value>
              </div>
            </div>

            <div className="clearfix">
              <div className="page-actions">
                <button className="btn btn-primary" onClick={this.addRegister.bind(this)}><i className="fa fa-plus"/> Add
                  registry
                </button>
              </div>
            </div>

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
