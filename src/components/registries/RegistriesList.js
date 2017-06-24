import React, {Component, PropTypes} from 'react';
import {DockTable, ActionMenu} from '../index';
import {NavContainer} from '../../components/index';
import {Badge, ButtonToolbar, Button, ProgressBar} from 'react-bootstrap';

export default class RegistriesList extends Component {
  static propTypes = {
    data: PropTypes.array,
    onNewEntry: PropTypes.func,
    manageRegistries: PropTypes.func,
    onActionInvoke: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    name: PropTypes.string
  };

  COLUMNS = [
    {
      name: 'name',
      label: 'Name',
      width: '30%',
      sortable: true,
      render: this.renderName
    },
    {
      name: 'username',
      label: 'Username',
      sortable: true,
      render: this.formatUserName
    },
    {
      name: 'registryType',
      label: 'Type',
      sortable: true
    },
    {
      name: 'url',
      label: 'URL',
      sortable: true
    },
    {
      name: 'errorMessage',
      label: 'Status',
      width: '20%',
      sortable: true,
      render: this.errorMessageRender
    },
    {
      name: 'actions',
      label: 'Actions',
      width: '50px',
      render: this.actionsRender.bind(this)
    }
  ];

  ACTIONS = [
    {
      key: "edit",
      title: "Edit",
      default: true
    },
    null,
    {
      key: "refresh",
      title: "Refresh"
    },
    {
      key: "delete",
      title: "Delete"
    }
  ];

  CLUSTER_REGISTRIES_ACTIONS = [
    {
      key: "deleteFromCluster",
      title: "Delete"
    }
  ];

  render() {
    const {name} = this.props;
    let panelClassName = name ? "panel panel-default" : "panel panel-default no-header-panel";
    let buttonBarClassName = name ? "pulled-right-toolbar" : "pulled-right-toolbar-noheader";
    return (
      <div className={panelClassName}>
        {this.props.loading && (
          <ProgressBar active now={100}/>
        )}
        {(this.props.data && !this.props.loading) && (
          <div>
            {name && (
              <NavContainer clusterName={name}/>
            )}
            <ButtonToolbar className={buttonBarClassName}>
              {!name && (
                <Button
                  bsStyle="primary"
                  className="pulled-right"
                  onClick={this.props.onNewEntry}
                >
                  <i className="fa fa-plus"/>&nbsp;
                  New Registry
                </Button>
              ) || (
                <Button
                  bsStyle="primary"
                  className="pulled-right"
                  onClick={this.props.manageRegistries}
                >
                  <i className="fa fa-pencil-square-o"/>&nbsp;
                  Add/Remove Registry
                </Button>
              )}
            </ButtonToolbar>
            <DockTable columns={this.COLUMNS}
                       rows={this.props.data}
            />
          </div>
        )}

        {this.props.data && this.props.data.length === 0 && (
          <div className="alert alert-no-results">
            No Registries yet
          </div>
        )}
      </div>
    );
  }

  actionsRender(registry) {
    const {name} = this.props;
    return (
      <td key="actions" className="td-actions">
        <ActionMenu subject={registry.name}
                    actions={ name ? this.CLUSTER_REGISTRIES_ACTIONS : this.ACTIONS}
                    actionHandler={this.props.onActionInvoke.bind(this)}
                    disabled = {!registry.editable && !name}
        />
      </td>
    );
  }

  errorMessageRender(registry) {
    const MAX_LEN = 60;
    let error = registry.errorMessage;
    let errorShort = "Connected";
    if (error != null) {
      errorShort = error.length > MAX_LEN + 3 ? error.slice(0, MAX_LEN) + '...' : error;
    }
    let statusClass = errorShort === "Connected" ? "up-status-count" : "down-status-count";
    return (
      <td key="errorMessage" title={error}>
        <Badge bsClass={"badge " + statusClass}>{errorShort}</Badge>
      </td>
    );
  }

  formatUserName(registry) {
    const username = registry.registryType === 'AWS' ? ('accessKey: ' + registry.accessKey) : registry.username;
    return (
      <td key="username">{username}</td>
    );
  }

  renderName(registry) {
    const name = registry.name === '' ? 'Docker Hub' : registry.name;
    return (
      <td key="registryName">{name}</td>
    );
  }
}
