import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import {DockTable, OnOff} from '../index';
import {Label, Badge, ButtonToolbar, SplitButton, MenuItem, Panel, Button, ProgressBar, Glyphicon} from 'react-bootstrap';

export default class DashboardClustersList extends Component {
  static propTypes = {
    data: PropTypes.array,
    loading: PropTypes.bool
  };

  COLUMNS = [
    {
      name: 'title',
      label: 'Name',
      sortable: true,
      width: '10%',
      render: this.nameRender
    },
    {
      name: 'description',
      label: 'Description',
      sortable: true,
      width: '30%'
    },
    {
      name: 'features',
      label: 'Type',
      width: '20%',
      render: this.featuresRender
    },
    {
      name: 'nodes',
      label: 'No of Nodes',
      render: this.nodesRender
    },
    {
      name: 'containers',
      label: '# of Containers',
      render: this.containersRender
    },
    {
      name: 'alerts',
      label: '# of Alerts'
    }
  ];

  render() {
    return (
      <div>
        <h3>Cluster List</h3>

        <Panel>
          {this.props.loading && (
            <ProgressBar active now={100} />
          )}

          {(this.props.data && !this.props.loading) && (
            <DockTable columns={this.COLUMNS}
                       rows={this.props.data}
                       searchable={false}
            />
          )}
        </Panel>
      </div>
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
}
