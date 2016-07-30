import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {load as loadRegistries} from 'redux/modules/registries/registries';
import {DockTable, StatisticsPanel} from '../../../components/index';
import {RegisterEdit} from '../../index';
import _ from 'lodash';
import {removeRegistry} from 'redux/modules/registries/registries';
import {ButtonToolbar, SplitButton, Button, MenuItem} from 'react-bootstrap';

const COLUMNS = [
  {
    name: 'name',
    label: 'Name',
    width: '15%',
    sortable: true
  },
  {
    name: 'host',
    label: 'Host',
    width: '20%',
    sortable: true
  },
  {
    name: 'errorMessage',
    label: 'Status',
    sortable: true,
    render: errorMessageRender
  },
  {
    name: 'actions',
    label: 'Actions',
    width: '15%'
  }
];

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

  statisticsMetrics = [
    {
      type: 'number',
      title: 'Registry Connected'
    }
  ];
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

    let rows = [...registries];
    this.additionalData(rows);

    let showLoading = false;
    let showError = false;
    let showData = false;
    let connectedRegistries = rows.length;

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
        values={[connectedRegistries]}
        />
        <div className="panel">
          <div className="panel-body">
            <div className="panel-content">
              <div className="clearfix">
                <div className="page-actions">
                  <button className="btn btn-primary"
                          onClick={this.editRegister.bind(this, null)}>
                    <i className="fa fa-plus"/>
                    Add registry
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
                                   rows={rows} />
                      </div>
                    </div>
                  )}

                  {rows && rows.length === 0 && (
                    <div className="alert alert-info">
                      No Registries yet
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

  additionalData(rows) {
    if (rows) {
      rows.forEach(row => {
        row.__attributes = {'data-name': row.name};
      });
    }
  }

  editRegister(registry = null) {
    let contentComponent = <RegisterEdit registry={registry}/>;
    window.simpleModal.show({
      contentComponent,
      focus: RegisterEdit.focusSelector
    });
  }

  editRegisterEvent(event) {
    let registry = this._getRegistryByTarget(event.target);
    this.editRegister(registry);
  }

  renderActions(registry) {
    return (<td key="actions" className="td-actions">
      <ButtonToolbar>
        <SplitButton bsStyle="info"
                     title="Edit"
                     onClick={this.editRegisterEvent.bind(this)}>

          <MenuItem eventKey="1" onClick={this.editRegisterEvent.bind(this)}>Edit</MenuItem>
          <MenuItem divider />
          <MenuItem eventKey="2" onClick={this.removeRegistry.bind(this)}>Delete</MenuItem>

        </SplitButton>
      </ButtonToolbar>
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
    //$tr.data() will return previous data if one row was removed
    let name = $tr.attr('data-name');
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
  let errorShort = "Connected";
  let msgStyle = "";
  if (error != null) {
    msgStyle = "alert alert-danger";
    errorShort = error.length > MAX_LEN + 3 ? error.slice(0, MAX_LEN) + '...' : error;
  }
  return (
      <td key="errorMessage" title={error} className={msgStyle}>{errorShort}</td>
  );
}

