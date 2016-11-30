import React, {Component, PropTypes} from 'react';
import { Link, RouteHandler } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import {DockTable, ActionMenu} from '../index';
import {Label, Badge, ButtonToolbar, SplitButton, MenuItem, Panel, Button, ProgressBar, Nav, NavItem} from 'react-bootstrap';
import {Dialog, PropertyGrid} from 'components';
import { Sparklines, SparklinesBars, SparklinesLine, SparklinesCurve, SparklinesNormalBand, SparklinesReferenceLine, SparklinesSpots } from 'react-sparklines';
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
      width: '20%',
      sortable: true
    },
    {
      name: 'address',
      label: 'IP Address',
      width: '15%',
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
      width: '15%',
      render: this.timeFormat
    },
    {
      name: 'health_stat',
      label: 'Health',
      width: '30%',
      render: this.healthStatRender
    },
    {
      name: 'actions',
      label: 'Actions',
      width: '0'
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
              No nodes yet
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
      <td key="docker">
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
      <td key="agent">
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
      <td key="cluster">
        {(registry.cluster != null) && (
          <Link to={`/clusters/${registry.cluster}`}>{registry.cluster}</Link>
        )}
        {(registry.cluster == null) && (
          <label>None</label>
        )}
      </td>
    );
  }

  timeFormat(registry) {
    let time = 'none';
    if (registry.time) {
      time = registry.time.substring(11, 19) + ' ' + registry.time.substring(0, 10);
    }
    return (
      <td key="since">
        {time}
      </td>
    );
  }

  healthStatRender(node) {
    let data = []; /*this.buildGraphData()*/
    return (
      <td key="stat">
        <Sparklines data={data} style={{ background: "#ffffff", border: "1px solid rgba(50, 50, 50, 0.5)" }} height={35} limit={30}>
          <SparklinesLine />
          <SparklinesSpots />
          <SparklinesNormalBand />
          <SparklinesReferenceLine type="median" />
        </Sparklines>
      </td>
    );
  }

  buildGraphData(n = 30) {
    return Array.apply(0, Array(n)).map(() => {
      let phase = false;
      let x1;
      let x2;
      let w;
      let x;
      let z;

      let ph = (phase = !phase);
      if (ph) {
        do {
          x1 = 2.0 * Math.random() - 1.0;
          x2 = 2.0 * Math.random() - 1.0;
          w = x1 * x1 + x2 * x2;
        } while (w >= 1.0);

        w = Math.sqrt((-2.0 * Math.log(w)) / w);
        x = x1;
      } else {
        x = x2;
      }

      return x * w;
    });
  }
}
