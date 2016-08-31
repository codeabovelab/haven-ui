import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import {DockTable, ActionMenu} from '../index';
import {Label, Badge, ButtonToolbar, SplitButton, MenuItem, Panel, Button, ProgressBar, Glyphicon} from 'react-bootstrap';

export default class NodesList extends Component {
  static propTypes = {
    data: PropTypes.array,
    loading: PropTypes.bool,
    onAddNode: PropTypes.func
  };

  COLUMNS = [
    {
      name: 'name',
      label: 'Name',
      width: '30%',
      sortable: true
    },
    {
      name: 'address',
      label: 'Address',
      width: '30%',
      sortable: true
    },
    {
      name: 'cluster',
      label: 'Cluster',
      width: '20%',
      sortable: true,
      render: this.clusterRender
    },
    {
      name: 'health',
      label: 'Health Status',
      width: '20%',
      render: this.healthRender
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
    const {data: rows} = this.props;
    const panelHeader = (
      <div className="clearfix">
        <h3>Nodes List</h3>
      </div>
    );

    this.additionalData(rows);

    return (
      <Panel header={panelHeader}>
          {this.props.loading && (
          <ProgressBar active now={100} />
      )}
      {(this.props.data && !this.props.loading) && (
        <DockTable columns={this.COLUMNS}
                    rows={rows}
        />
      )}
      </Panel>
    );
  }

  additionalData(rows) {
    if (rows) {
      rows.forEach(row => {
        row.__attributes = {'data-id': row.id};
        row.actions = this.tdActions.bind(this);
      });
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

  onActionInvoke(action, nodes) {
    console.log('onActionInvokeNodes', action, nodes);
  }

  healthRender(registry) {
    return (
      <td>
        {(registry.health.healthy) && (
          <Label bsStyle="success">Healthy</Label>
        )}
        {(!registry.health.healthy) && (
          <Label bsStyle="warning">Not Healthy</Label>
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
}
