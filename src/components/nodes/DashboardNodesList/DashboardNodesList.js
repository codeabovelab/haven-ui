import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import {DockTable, OnOff} from '../../index';
import {Label, Badge, ButtonToolbar, SplitButton, MenuItem, Panel, Button, ProgressBar, Glyphicon} from 'react-bootstrap';
import _ from 'lodash';

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
      label: 'Node',
      render: this.nodeRender,
      width: '40%'
    },
    {
      name: 'cluster',
      label: 'Cluster',
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
                       searchable={false}
            />
          )}
        </Panel>
      </div>
    );
  }

  metricRender(node) {
    let metricValue = node.health[this.props.metric];

    if (this.props.metric === "sysMemUsed") {
      metricValue = (node.health[this.props.metric] / 1024 / 1024 / 1024).toFixed(2);
      metricValue = `${metricValue} GB`;
    }

    if (this.props.metric === "networkIO") {
      const nets = node.health.net;
      let bytesIn = 0;
      let bytesOut = 0;
      _.forEach(nets, (el) => {
        bytesIn += _.get(el, 'bytesIn', 0);
        bytesOut += _.get(el, 'bytesOut', 0);
      });
      let metricValueIn = (bytesIn / 1024 / 1024 / 1024).toFixed(1);
      let metricValueOut = (bytesOut / 1024 / 1024 / 1024).toFixed(1);
      metricValue = `${metricValueIn}G/${metricValueOut}G`;
    }

    if (this.props.metric === "sysCpuLoad") {
      metricValue = metricValue + '%';
    }
    return (
      <td key="metric">
        {metricValue}
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
