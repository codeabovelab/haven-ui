import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import {DockTable, OnOff} from '../../index';
import {Label, Badge, ButtonToolbar, SplitButton, MenuItem, Panel, Button, ProgressBar, Glyphicon} from 'react-bootstrap';

export default class DashboardNodesList extends Component {
  static propTypes = {
    metric: PropTypes.string,
    metricTitle: PropTypes.string,
    title: PropTypes.string,
    count: PropTypes.number,
    data: PropTypes.array,
    loading: PropTypes.bool,
    onNewCluster: PropTypes.func
  };

  COLUMNS = [
    {
      name: 'name',
      label: this.props.metricTitle,
      render: this.metricRender.bind(this)
    },
    {
      name: 'title',
      label: 'Node Name',
      render: this.nodeRender,
      width: '40%'
    },
    {
      name: 'cluster',
      label: 'Cluster Name',
      render: this.clusterRender,
      width: '25%'
    }
  ];

  render() {
    return (
      <div>
        <h3>{this.props.title}</h3>

        <Panel>
          {this.props.loading && (
            <ProgressBar active now={100} />
          )}

          {(this.props.data && !this.props.loading) && (
            <DockTable columns={this.COLUMNS}
                       rows={this.props.data}
            />
          )}
        </Panel>
      </div>
    );
  }

  metricRender(node) {
    return (
      <td key="metric">
        {node.health[this.props.metric]}
      </td>
    );
  }

  nodeRender(node) {
    return (
      <td key="node">
        {node.name}
      </td>
    );
  }

  clusterRender(node) {
    return (
      <td key="cluster">
        <Link to={`/clusters/${node.cluster}`}>{node.cluster}</Link>
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
}
