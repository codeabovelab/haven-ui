import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {load as loadRegistries} from 'redux/modules/registries/registries';
import {DockTable} from '../../../components/index';
import {RegisterAdd} from '../../index';
import _ from 'lodash';
import {removeRegistry} from 'redux/modules/registries/registries';

const COLUMNS = [{name: 'name'}, {name: 'inactive', render: inactiveRender},
  {name: 'errorMessage', label: 'Error', render: errorMessageRender}, {name: 'actions'}];

COLUMNS.forEach(column => column.sortable = column.name !== 'actions');

@connect(
  state => ({
    registries: state.registries,
    registriesUI: state.registriesUI
  }), {loadRegistries, removeRegistry})
export default class RegistriesList extends Component {
  static propTypes = {
    registries: PropTypes.array.isRequired,
    registriesUI: PropTypes.object.isRequired,
    loadRegistries: PropTypes.func.isRequired,
    removeRegistry: PropTypes.func.isRequired
  };

  constructor(...params) {
    super(...params);
    let actionColumn = COLUMNS.find(column => column.name === 'actions');
    actionColumn.render = this.renderActions.bind(this);
  }

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

  renderActions(registry) {
    return (<td key="actions" className="td-actions">
      <i className="fa fa-pencil" data-toggle="tooltip" data-placement="top" title="Show Logs"
         onClick={this.showLog.bind(this)}/>
      | <i className="fa fa-trash" data-toggle="tooltip" title="Start"
           onClick={this.removeRegistry.bind(this)}/>
    </td>);
  }

  removeRegistry(event) {
    const {removeRegistry, loadRegistries} = this.props;
    let registry = this._getRegistryByTarget(event.target);
    confirm('Are you sure you want to remove registry?')
      .then(() => {
        removeRegistry(registry.name).catch(() => null)
          .then(() => loadRegistries());
      })
      .catch(() => null);// confirm cancel
  }

  _getRegistryByTarget(target) {
    const {registries} = this.props;
    let $tr = $(target).parents('tr');
    let name = $tr.data('name');
    return registries.find(registry => registry.name === name);
  }
}

function inactiveRender(registry) {
  let inactive = registry.active ? "" : "yes";
  return <td key="inactive">{inactive}</td>;
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

