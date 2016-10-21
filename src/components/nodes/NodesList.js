import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import {DockTable, ActionMenu} from '../index';
import {Label, Badge, ButtonToolbar, SplitButton, MenuItem, Panel, Button, ProgressBar, Glyphicon} from 'react-bootstrap';
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
    const {data} = this.props;
    const rows = this.additionalData(data);
    const panelHeader = (
      <div className="clearfix">
        <h3>Nodes List</h3>

        {this.props.clusterName && (
        <ButtonToolbar>
          <Button
            bsStyle="primary"
            onClick={this.props.manageNodes}
          >
            <i className="fa fa-plus" />&nbsp;
            Add/Remove Node
          </Button>
        </ButtonToolbar>
        )}
      </div>
    );

    return (
      <div>
        <Panel header={panelHeader}>
          {this.props.loading && (
            <ProgressBar active now={100} />
          )}

          {(this.props.data && !this.props.loading) && (
            <DockTable columns={this.COLUMNS}
              rows={rows}
            />
          )}

          {(this.props.data && this.props.data.length === 0) && (
            <div className="alert alert-info">
              No nodes yet
            </div>
          )}

        </Panel>

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
