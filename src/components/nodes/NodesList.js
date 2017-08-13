import React, {Component, PropTypes} from 'react';
import { Link, RouteHandler } from 'react-router';
import {DockTable, ActionMenu, Chain, LoadingDialog} from '../index';
import {Badge, ButtonToolbar, Button, ProgressBar, Popover} from 'react-bootstrap';
import {Dialog, PropertyGrid, NavContainer} from 'components';
import TimeUtils from 'utils/TimeUtils';
import _ from 'lodash';

export default class NodesList extends Component {
  static propTypes = {
    data: PropTypes.array,
    loading: PropTypes.bool,
    clusterName: PropTypes.string,
    manageNodes: PropTypes.func,
    loadNodes: PropTypes.func.isRequired,
    deleteNode: PropTypes.func.isRequired
  };

  COLUMNS = [
    {
      name: 'name',
      label: 'Node Name',
      width: '20%',
      sortable: true
    },
    {
      name: 'address',
      label: 'IP Address',
      width: '10%',
      sortable: true
    },
    {
      name: 'cluster',
      label: 'Cluster',
      width: '10%',
      sortable: true,
      render: this.clusterRender
    },
    {
      name: 'reservedCPUS',
      label: 'Reserved CPUs',
      width: '4%',
      render: this.cpusRender
    },
    {
      name: 'reservedMemory',
      label: 'Reserved Memory',
      width: '7%',
      render: this.memoryRender
    },
    {
      name: 'labels',
      label: 'Labels',
      width: '10%',
      render: this.labelsRender
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
      width: '40%',
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
    },
    {
      key: "delete",
      title: "Delete"
    }
  ];

  render() {
    const {data, clusterName} = this.props;
    const rows = this.additionalData(data);
    let name = clusterName ? clusterName : "all";
    let columns = this.COLUMNS;
    if (name === "all") {
      columns = columns.filter((object)=> object.name !== 'reservedCPUS' && object.name !== 'reservedMemory');
    }
    return (
      <div key={name}>
        <div className="panel panel-default">
          <NavContainer clusterName={name}/>
          {(this.props.data && !this.props.loading) && (
            <div>
              {this.props.clusterName && (
                <ButtonToolbar className="pulled-right-toolbar">
                  <Button
                    bsStyle="primary"
                    className="pulled-right"
                    onClick={this.props.manageNodes}
                  >
                    <i className="fa fa-pencil-square-o"/>&nbsp;
                    Add/Remove Node
                  </Button>
                </ButtonToolbar>
              )}
              <div className="nodes">
                <DockTable columns={columns}
                           rows={rows}
                />
              </div>
            </div>
          )}
          {this.props.loading && (
            <div className="progressBarBlock">
              <ProgressBar active now={100}/>
            </div>
          )}
          {(this.props.data && this.props.data.length === 0) && (
            <div className="alert alert-no-results">
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

      case "delete":
        confirm(`Are you sure you want to delete node ${node.name}?`)
          .then(() => {
            this.setState({
              actionDialog: (
                <LoadingDialog node={node}
                               entityType="node"
                               onHide={this.onHideDialog.bind(this)}
                               name=""
                               longTermAction={this.props.deleteNode}
                               refreshData={this.props.loadNodes}
                               actionKey="deleted"
                />
              )
            });
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

  healthRender(row) {
    let labelStyle;
    if ((!row.on && row.health.healthy) || !row.time ) {
      labelStyle = "off-status-count";
    }
    return (
      <td key="health">
        {(row.health.healthy) && (
          <Badge bsClass={"badge " + (labelStyle ? labelStyle : "up-status-count")}>Healthy</Badge>
        )}
        {(!row.health.healthy) && (
          <Badge bsClass={"badge " + (labelStyle ? labelStyle : "warning-status-count")}>Not Healthy</Badge>
        )}
      </td>
    );
  }

  agentHealthRender(row) {
    return (
      <td key="agentHealth">
        {(row.on) && (
          <Badge bsClass="badge up-status-count">On</Badge>
        )}
        {(!row.on) && (
          <Badge bsClass="badge off-status-count">Off</Badge>
        )}
      </td>
    );
  }

  cpusRender(row) {
    const cpusReserved = row.health.swarmCpusReserved ? row.health.swarmCpusReserved : '-';
    const cpusTotal = row.health.swarmCpusTotal ? row.health.swarmCpusTotal : '-';
    return (
      <td key="cpus">
        <span>{cpusReserved + '/' + cpusTotal}</span>
      </td>
    );
  }

  memoryRender(row) {
    return (
      <td key="memory">
        <span>{bytesToMb(row.health.swarmMemReserved) + '/' + bytesToMb(row.health.swarmMemTotal) + ' MB'}</span>
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
      <Popover id={el + '-popover'}>
        {_.map(labels, (el, i)=> {
          if (typeof(el) !== 'undefined') {
            return (<div key={el + i}><span>{el}</span><br></br></div>);
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

  clusterRender(row) {
    return (
      <td key="cluster">
        {(row.cluster != null) && (
          <Link to={`/clusters/${row.cluster}`}>{row.cluster}</Link>
        )}
        {(row.cluster == null) && (
          <label>None</label>
        )}
      </td>
    );
  }

  timeFotmat(row) {
    let time = 'none';
    if (row.time) {
      const currentTime = + new Date();
      const previousTime = + new Date(row.time);
      time = TimeUtils.timeDifference(currentTime, previousTime);
    }
    return (
      <td key="time">
        {time}
      </td>
    );
  }
}

function bytesToMb(value) {
  return Math.round(value / 1048576);
}
