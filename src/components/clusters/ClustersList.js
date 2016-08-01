import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import {DockTable, OnOff} from '../index';
import {Label, Badge, ButtonToolbar, SplitButton, MenuItem, Panel, Button, ProgressBar, Glyphicon} from 'react-bootstrap';

export default class ClustersList extends Component {
  static propTypes = {
    data: PropTypes.array,
    loading: PropTypes.bool,
    onNewCluster: PropTypes.func
  };

  COLUMNS = [
    {
      name: 'name',
      label: 'ID',
      width: '15%',
      sortable: true,
      render: this.nameRender
    },
    {
      name: 'title',
      label: 'Name',
      sortable: true,
      render: this.titleRender
    },
    {
      name: 'containers',
      label: '# of Containers',
      width: '15%',
      render: this.containersRender
    },
    {
      name: 'nodes',
      label: '# of Nodes',
      width: '15%',
      render: this.nodesRender
    },
    {
      name: 'Actions',
      width: '50px',
      render: this.actionsRender
    }
  ];

  render() {
    const panelHeader = (
      <div className="clearfix">
        <h3>Cluster List</h3>

        <ButtonToolbar>
          <Button
            bsStyle="primary"
            onClick={this.props.onNewCluster}
          >
            <i className="fa fa-plus" />&nbsp;
            New Cluster
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

  nameRender(cluster) {
    return (
      <td key="name">
        <Link to={`/clusters/${cluster.name}`}>{cluster.name}</Link>
      </td>
    );
  }

  titleRender(cluster) {
    return (
      <td key="title">
        <Link to={`/clusters/${cluster.name}`}>{cluster.title || cluster.name}</Link>
        <div>{cluster.description}</div>
      </td>
    );
  }

  featuresRender(cluster) {
    return (
      <td key="features">
        {cluster.features.map((feature) => {
          return (
            <Label bsStyle="info">{feature}</Label>
          );
        })}
      </td>
    );
  }

  containersRender(cluster) {
    return (
      <td key="containers">
        <OnOff on={cluster.containers.on}
               off={cluster.containers.off} />
      </td>
    );
  }

  nodesRender(cluster) {
    return (
      <td key="nodes">
        <OnOff on={cluster.nodes.on}
               off={cluster.nodes.off} />
      </td>
    );
  }

  actionsRender() {
    return (
      <td key="actions" className="td-actions">
        <ButtonToolbar bsStyle="default">
          <SplitButton bsStyle="info"
                       title="Edit"
                       pullRight>

            <MenuItem eventKey="1">Edit</MenuItem>
            <MenuItem divider />
            <MenuItem eventKey="2">Information</MenuItem>
            <MenuItem eventKey="3">Config</MenuItem>
            <MenuItem divider />
            <MenuItem eventKey="7">Delete</MenuItem>

          </SplitButton>
        </ButtonToolbar>
      </td>
    );
  }
}