import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import {DockTable, OnOff, ActionMenu} from '../index';
import {RegistryEdit} from '../../containers/index';
import {Label, Badge, ButtonToolbar, SplitButton, MenuItem, Panel, Button, ProgressBar, Glyphicon, Nav, NavItem, Image} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

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
      width: '20%',
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
      width: '30%',
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
              <Nav bsStyle="tabs" className="dockTable-nav">
                <LinkContainer to={"/clusters/" + name}>
                  <NavItem eventKey={1}>Containers</NavItem>
                </LinkContainer>
                <LinkContainer to={"/clusters/" + name + "/" + "applications"}>
                  <NavItem eventKey={2} disabled={name === "all"}>Applications</NavItem>
                </LinkContainer>
                <LinkContainer to={"/clusters/" + name + "/" + "nodes"}>
                  <NavItem eventKey={3}>Nodes</NavItem>
                </LinkContainer>
                <LinkContainer to={"/clusters/" + name + "/" + "events"}>
                  <NavItem eventKey={4}>Events</NavItem>
                </LinkContainer>
                <LinkContainer to={"/clusters/" + name + "/" + "registries"}>
                  <NavItem eventKey={5} disabled={name === "all"}>Registries</NavItem>
                </LinkContainer>
              </Nav>
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
          <div className="alert alert-info">
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
    let msgStyle = "";
    if (error != null) {
      msgStyle = "alert alert-danger";
      errorShort = error.length > MAX_LEN + 3 ? error.slice(0, MAX_LEN) + '...' : error;
    }
    return (
      <td key="errorMessage" title={error} className={msgStyle}>{errorShort}</td>
    );
  }

  formatUserName(registry) {
    const username = registry.registryType === 'AWS' ? ('accessKey: ' + registry.accessKey) : registry.username;
    return (
      <td>{username}</td>
    );
  }

  renderName(registry) {
    const name = registry.name === '' ? 'Docker Hub' : registry.name;
    return (
      <td>{name}</td>
    );
  }
}
