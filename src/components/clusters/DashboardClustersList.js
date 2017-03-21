import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import {DockTable, OnOff, Chain} from '../index';
import _ from 'lodash';
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
      sortable: true,
      render: this.typeRender
    },
    {
      name: 'nodes',
      label: 'Node Count',
      render: this.nodesRender
    },
    {
      name: 'containers',
      label: 'Container Count ',
      render: this.containersRender
    },
    {
      name: 'alertsCount',
      label: 'Alert Count',
      render: this.alertsRender
    },
    {
      name: 'applications',
      label: 'Applications',
      render: this.applicationsRender
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

  typeRender(cluster) {
    return (
      <td key="features">
        <span>{_.get(cluster, 'features[0]', '')}</span>
      </td>
    );
  }

  containersRender(cluster) {
    return (
      <td key="containers">
        <OnOff on={cluster.containers.on}
               off={cluster.containers.off}
               href={"/clusters/" + cluster.name}/>
      </td>
    );
  }

  nodesRender(cluster) {
    return (
      <td key="nodes">
        <OnOff on={cluster.nodes.on}
               off={cluster.nodes.off}
               href={"/clusters/" + cluster.name + "/nodes"}/>
      </td>
    );
  }

  applicationsRender(cluster) {
    return (
      <td key="applications">
        <Chain data={cluster.applications || []}
               link={"/clusters/" + cluster.name + "/applications"}
               maxCount={3}
        />
      </td>
    );
  }

  alertsRender(cluster) {
    return (
      <td key="alerts">
        <Link to={`/clusters/${cluster.name}/events`}>{cluster.alertsCount}</Link>
      </td>
    );
  }
}
