import React, {Component, PropTypes} from 'react';
import {loadImages} from 'redux/modules/images/images';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {reduxForm} from 'redux-form';
import {DockTable} from '../../../components/index';
import {RegisterAdd} from '../../index';
import _ from 'lodash';

const COLUMNS = [{name: 'registry'}, {name: 'name'}];

COLUMNS.forEach(column => column.sortable = column.name !== 'actions');
const GROUP_BY_SELECT = ['registry', 'name'];

@connect(
  state => ({
    images: state.images,
    imagesUI: state.imagesUI,
    registries: state.registries,
    registriesUI: state.registriesUI
  }), {loadImages})
export default class ImagesList extends Component {
  static propTypes = {
    images: PropTypes.object.isRequired,
    imagesUI: PropTypes.object.isRequired,
    registries: PropTypes.array.isRequired,
    registriesUI: PropTypes.object.isRequired,
    loadImages: PropTypes.func.isRequired
  };

  componentDidMount() {
    const {loadImages} = this.props;
    loadImages();
    $('.input-search').focus();
  }

  getRegisters() {
    return Object.keys(this.props.images.byRegistry);
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
      <div className="container-fluid">
        <h1>Images</h1>
        <div className="page-info-group">
          <div>
            <label># of Images:</label>
            <value>{rows.length}</value>
          </div>
          <div>
            <label># of Registers:</label>
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
        {showData && <div>
          {rows && rows.length > 0 &&
          <div>
            <div className="containers">
              <DockTable columns={COLUMNS} rows={rows} title="Images" groupBy="registry"
                         groupBySelect={GROUP_BY_SELECT}/>
            </div>
          </div>
          }
          {rows && rows.length === 0 &&
          <div className="alert alert-info">
            No images yet
          </div>}
        </div>}
        {showError && <div className="alert alert-danger">{loadingError}</div>}
      </div>
    );
  }

  addRegister() {
    let contentComponent = <RegisterAdd/>;
    window.simpleModal.show({
      contentComponent,
      focus: RegisterAdd.focusSelector
    });
  }
}
