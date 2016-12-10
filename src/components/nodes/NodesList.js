import React, {Component, PropTypes} from 'react';
import { Link, RouteHandler } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import {DockTable, ActionMenu, Chain} from '../index';
import {Label, Badge, ButtonToolbar, SplitButton, MenuItem, Panel, Button, ProgressBar, Nav, NavItem, Popover} from 'react-bootstrap';
import {Dialog, PropertyGrid} from 'components';
import _ from 'lodash';

export default class NodesList extends Component {
  static propTypes = {
    data: PropTypes.array,
    loading: PropTypes.bool,
    clusterName: PropTypes.string,
    manageNodes: PropTypes.func
  };

  COLUMNS = [
    {
      name: 'name',
      label: 'Node Name',
      width: '30%',
      sortable: true
    },
    {
      name: 'address',
      label: 'IP Address',
      width: '20%',
      sortable: true
    },
    {
      name: 'cluster',
      label: 'Cluster',
      width: '15%',
      sortable: true,
      render: this.clusterRender
    },
    {
      name: 'health',
      label: 'Docker Health',
      width: '10%',
      render: this.healthRender
    },
    {
      name: 'labels',
      label: 'Labels',
      width: '10%',
      render: this.labelsRender
    },
    {
      name: 'agentHealth',
      label: 'Agent Health',
      width: '10%',
      render: this.agentHealthRender
    },
    {
      name: 'time',
      label: 'Healthy Since',
      width: '30%',
      render: this.timeFotmat
    },
    {
      name: 'actions',
      label: 'Actions',
      width: '20%'
    }
  ];

  ACTIONS = [
    {
      key: "info",
      title: "Info"
    }
  ];

  render() {
    const {data, clusterName} = this.props;
    const rows = this.additionalData(data);
    let nodesNavId = clusterName ? "/clusters/" + clusterName + "/" + "nodes" : "/nodes";
    let name = clusterName ? clusterName : "all";

    return (
      <div>
        <div className="panel panel-default">
          {this.props.loading && (
            <ProgressBar active now={100}/>
          )}

          {(this.props.data && !this.props.loading) && (
            <div>

              <Nav bsStyle="tabs" className="dockTable-nav">
                <LinkContainer to={"/clusters/" + name}>
                  <NavItem eventKey={1}>Containers</NavItem>
                </LinkContainer>
                <LinkContainer to={"/clusters/" + name + "/" + "applications"}>
                  <NavItem eventKey={2} disabled={name === "all"}>Applications</NavItem>
                </LinkContainer>
                <LinkContainer to={nodesNavId}>
                  <NavItem eventKey={3}>Nodes</NavItem>
                </LinkContainer>
                <LinkContainer to={"/clusters/" + name + "/" + "events"}>
                  <NavItem eventKey={4}>Events</NavItem>
                </LinkContainer>
                <LinkContainer to={"/clusters/" + name + "/" + "registries"}>
                  <NavItem eventKey={5} disabled={name === "all"}>Registries</NavItem>
                </LinkContainer>
                <LinkContainer to={"/clusters/" + name + "/" + "images"}>
                  <NavItem eventKey={5} disabled={name === "all"}>Update</NavItem>
                </LinkContainer>
              </Nav>
              {this.props.clusterName && (
                <ButtonToolbar className="pulled-right-toolbar">
                  <Button
                    bsStyle="primary"
                    className="pulled-right"
                    onClick={this.props.manageNodes}
                  >
                    <i className="fa fa-pencil-square-o" />&nbsp;
                    Add/Remove Node
                  </Button>
                </ButtonToolbar>
              )}
              <div className="nodes">
              <DockTable columns={this.COLUMNS}
                         rows={rows}
              />
              </div>
            </div>
          )}

          {(this.props.data && this.props.data.length === 0) && (
            <div className="alert alert-info">
              No nodes to display
            </div>
          )}

        </div>

        {(this.state && this.state.actionDialog) && (
          <div>
            {this.state.actionDialog}
          </div>
        )}
      </div>
    );
  }

  additionalData(rows) {
    if (rows) {
      return rows.map(row => ({
        ...row,
        __attributes: {'data-id': row.id},
        time: row.health.time,
        actions: this.tdActions.bind(this)
      }));
    }
  }

  tdActions(node) {
    return (
      <td className="td-actions" key="actions">
        <ActionMenu subject={node.id}
                    actions={this.ACTIONS}
                    actionHandler={this.onActionInvoke.bind(this)}
        />

      </td>
    );
  }

  onActionInvoke(action, nodeId) {
    const node = this.props.data.filter((i)=>(i.id === nodeId))[0];

    switch (action) {
      case "info":
        this.setState({
          actionDialog: this.getDialog(node)
        });
        return;

      default:
        return;
    }
  }

  getDialog(node) {
    return (
      <Dialog show
              hideCancel
              size="large"
              title={`Node Details: ${node.name}`}
              okTitle="Close"
              onHide={this.onHideDialog.bind(this)}
              onSubmit={this.onHideDialog.bind(this)}
      >

        <PropertyGrid data={node} />

      </Dialog>
    );
  }

  onHideDialog() {
    this.setState({
      actionDialog: undefined
    });
  }

  healthRender(registry) {
    let labelStyle;
    if ((!registry.on && registry.health.healthy) || !registry.time ) {
      labelStyle = "default";
    }
    return (
      <td>
        {(registry.health.healthy) && (
          <Label bsStyle={labelStyle ? labelStyle : "success"}>Healthy</Label>
        )}
        {(!registry.health.healthy) && (
          <Label bsStyle={labelStyle ? labelStyle : "warning"}>Not Healthy</Label>
        )}
      </td>
    );
  }

  agentHealthRender(registry) {
    return (
      <td>
        {(registry.on) && (
          <Label bsStyle="success">On</Label>
        )}
        {(!registry.on) && (
          <Label bsStyle="default">Off</Label>
        )}
      </td>
    );
  }

  labelsRender(row) {
    let labels = [];
    _.map(row.labels, (el, i)=>{
      if (typeof(el) === 'string') {
        labels.push(i + ': ' + el);
      }
    });
    let popoverRender = (el) => (
      <Popover>
        {_.map(labels, (el, i)=> {
          if (typeof(el) !== 'undefined') {
            return (<div><span>{el}</span><br></br></div>);
          }
        })}
      </Popover>
    );
    return (
      <td key="labels">
        <Chain data={labels.length > 0 ? ['Labels'] : []}
               popoverPlacement="top"
               popoverRender={popoverRender}
               render={() => (<span title="Labels">Labels</span>)}
        />
      </td>
    );
  }

  clusterRender(registry) {
    return (
      <td>
        {(registry.cluster != null) && (
          <Link to={`/clusters/${registry.cluster}`}>{registry.cluster}</Link>
        )}
        {(registry.cluster == null) && (
          <label>None</label>
        )}
      </td>
    );
  }

  timeFotmat(registry) {
    let time = 'none';
    if (registry.time) {
      time = registry.time.substring(11, 19) + ' ' + registry.time.substring(0, 10);
    }
    return (
      <td>
        {time}
      </td>
    );
  }
}
