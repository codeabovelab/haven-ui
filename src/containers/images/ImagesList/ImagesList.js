import React, {Component, PropTypes} from 'react';
import {loadImages} from 'redux/modules/images/images';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {reduxForm} from 'redux-form';
import {DockTable} from '../../../components/index';
import {RegisterAdd} from '../../index';
import _ from 'lodash';

const COLUMNS = [{name: 'register'}, {name: 'name'}];

COLUMNS.forEach(column => column.sortable = column.name !== 'actions');
const GROUP_BY_SELECT = ['register', 'name'];

@connect(
  state => ({
    images: state.images
  }), {loadImages})
export default class ImagesList extends Component {
  static propTypes = {
    images: PropTypes.object,
    loadImages: PropTypes.func.isRequired
  };

  componentDidMount() {
    const {loadImages} = this.props;
    loadImages();
  }

  getImagesList() {
    let imagesList = [];
    const {images} = this.props;
    Object.keys(images).forEach(registerName => {
      let register = images[registerName];
      _.forOwn(register, image => {
        imagesList.push(image);
      });
    });
    return imagesList;
  }

  getRegisters() {
    return Object.keys(this.props.images);
  }

  render() {
    let rows = this.getImagesList();
    let registers = this.getRegisters();

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
            <value>{registers.length}</value>
          </div>
        </div>
        <div className="clearfix">
          <div className="page-actions">
            <button className="btn btn-primary" onClick={this.addRegister.bind(this)}><i className="fa fa-plus"/> Add
              registry
            </button>
          </div>
        </div>
        <div>
          {rows && rows.length > 0 &&
          <div>
            <div className="containers">
              <DockTable columns={COLUMNS} rows={rows} title="Images" groupBy="register"
                         groupBySelect={GROUP_BY_SELECT}/>
            </div>
          </div>
          }
          {rows && rows.length === 0 &&
          <div className="alert alert-info">
            No images yet
          </div>}
        </div>
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
