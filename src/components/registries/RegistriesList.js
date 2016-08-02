import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import {DockTable, OnOff} from '../index';
import {RegistryEdit} from '../../containers/index';
import {Label, Badge, ButtonToolbar, SplitButton, MenuItem, Panel, Button, ProgressBar, Glyphicon} from 'react-bootstrap';

export default class RegistriesList extends Component {
  static propTypes = {
    data: PropTypes.array,
    onLoadReg: PropTypes.func,
    onRemoveReg: PropTypes.func,
//    uiMeta: PropTypes.array,
    loading: PropTypes.bool,
  };

  COLUMNS = [
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
      render: this.errorMessageRender
    },
    {
      name: 'actions',
      label: 'Actions',
      width: '15%',
      render: this.actionsRender
    }
  ];

  render() {
    const panelHeader = (
      <div className="clearfix">
        <h3>Registry List</h3>

        <ButtonToolbar>
          <Button
            bsStyle="primary"
            onClick={this.editRegistry.bind(this.null)}
          >
            <i className="fa fa-plus"/>&nbsp;
            New Registry
          </Button>
        </ButtonToolbar>
      </div>
    );

    return (
      <Panel header={panelHeader}>
        {this.props.loading && (
          <ProgressBar active now={100}/>
        )}


        {(this.props.data && !this.props.loading) && (
          <DockTable columns={this.COLUMNS}
                     rows={this.props.data}
          />
        )}

        {this.props.data && this.props.data.length === 0 && (
          <div className="alert alert-info">
            No Registries yet
          </div>
        )}
      </Panel>
    );
  }

  actionsRender() {
    return (
      <td key="actions" className="td-actions">
        <ButtonToolbar>
          <SplitButton bsStyle="info"
                       title="Edit"
                       >
            <MenuItem eventKey="1" >Edit</MenuItem>
            <MenuItem divider />
            <MenuItem eventKey="2" >Delete</MenuItem>
          </SplitButton>
        </ButtonToolbar>
      </td>
    );
  }

  errorMessageRender(registry) {
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

  editRegistryEvent(event) {
    let registry = this._getRegistryByTarget(event.target);
    this.editRegistry(registry);
  }

  editRegistry(registry = null) {
    let contentComponent = <RegistryEdit registry={registry}/>;
    window.simpleModal.show({
      contentComponent,
      focus: RegistryEdit.focusSelector
    });
  }
  removeRegistry(event) {
    const {onRemoveReg, onLoadReg} = this.props;
    let registry = this._getRegistryByTarget(event.target);
    confirm('Are you sure you want to remove this registry?')
      .then(() => {
        onRemoveReg(registry.name).catch(() => null)
          .then(() => onLoadReg());
      })
      .catch(() => null);// confirm cancel
  }

  _getRegistryByTarget(target) {
    const {registries} = this.props.data;
    let $tr = $(target).parents('tr');
    //$tr.data() will return previous data if one row was removed
    let name = $tr.attr('data-name');
    return registries.find(registry => registry.name === name);
  }
}
