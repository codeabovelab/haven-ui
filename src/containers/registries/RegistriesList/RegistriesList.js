import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {load as loadRegistries} from 'redux/modules/registries/registries';
import {DockTable} from '../../../components/index';
import {RegisterAdd} from '../../index';
import _ from 'lodash';

const COLUMNS = [{name: 'name'}, {name: 'inactive', render: inactiveRender}, {name: 'errorMessage', label: 'Error', render: errorMessageRender}];

COLUMNS.forEach(column => column.sortable = column.name !== 'actions');

@connect(
  state => ({
    registries: state.registries,
    registriesUI: state.registriesUI
  }), {loadRegistries})
export default class RegistriesList extends Component {
  static propTypes = {
    registries: PropTypes.array.isRequired,
    registriesUI: PropTypes.object.isRequired,
    loadRegistries: PropTypes.func.isRequired
  };

  componentDidMount() {
    const {loadRegistries} = this.props;
    loadRegistries();
    $('.input-search').focus();
  }

  render() {
    const {loading, loadingError} = this.props.registriesUI;
    const {registries, registriesUI} = this.props;

    let rows = registries;
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
        <h1>Registries</h1>
        <div className="page-info-group">
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
        {showData && <div>
          {rows && rows.length > 0 &&
          <div>
            <div className="containers">
              <DockTable columns={COLUMNS} rows={rows}/>
            </div>
          </div>
          }
          {rows && rows.length === 0 &&
          <div className="alert alert-info">
            No Registries yet
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

function inactiveRender(registry) {
  let inactive = registry.active ? "" : "yes";
  return <td>{inactive}</td>;
}

function errorMessageRender(registry) {
  const MAX_LEN = 60;
  let error = registry.errorMessage;
  let errorShort = "";
  if (error) {
    errorShort = error.length > MAX_LEN + 3 ? error.slice(0, MAX_LEN) + '...' : error;
  }
  return (
    <td key="errorMessage" title={error}>{errorShort}</td>
  );
}
