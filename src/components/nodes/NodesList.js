import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import {DockTable} from '../index';
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
      width: '20%',
      sortable: true
    },
    {
      name: 'address',
      label: 'Address',
      width: '20%',
      sortable: true
    },
    {
      name: 'health',
      label: 'Health Status',
      width: '40%'
    },
    {
      name: 'Actions',
      width: '20%',
      render: this.actionsRender
    }
  ];

  render() {
    const panelHeader = (
      <div className="clearfix">
        <h3>Nodes List</h3>

        <ButtonToolbar>
          <Button
          bsStyle="primary"
          onClick={this.props.onAddNode}
        >
        <i className="fa fa-plus" />&nbsp;
          Add Node
          </Button>
        </ButtonToolbar>
      </div>
    );

    return (
      <Panel header={panelHeader}>
          {this.props.loading && (
          <ProgressBar active now={100} />
      )}
      {(this.props.data && !this.props.loading) && (
        <DockTable columns={this.COLUMNS}
                    rows={this.props.data}
        />
      )}
      </Panel>
    );
  }

  actionsRender() {
    return (
      <td key="actions" className="td-actions">
      <ButtonToolbar bsStyle="default">
      <SplitButton bsStyle="info"
    title="Edit">
      <MenuItem eventKey="1">Edit</MenuItem>
      <MenuItem divider />
    <MenuItem eventKey="2">Delete</MenuItem>
      </SplitButton>
      </ButtonToolbar>
      </td>
  );
  }
}
