import React, {Component, PropTypes} from 'react';
import {load} from 'redux/modules/clusters/clusters';
import {connect} from 'react-redux';
import { Link } from 'react-router';
import {DockTable, ClustersList, StatisticsPanel, Dialog} from '../../../components';
import {ClusterAdd} from '../../index';
import {Label, Badge, ButtonToolbar, SplitButton, MenuItem, Panel, Button, ProgressBar} from 'react-bootstrap';

@connect(
  state => ({
    clusters: state.clusters,
    clustersIds: state.clustersUI.list
  }), {load})
export default class ClustersPanel extends Component {
  static propTypes = {
    clusters: PropTypes.object,
    clustersIds: PropTypes.array,
    load: PropTypes.func.isRequired
  };

  statisticsMetrics = [
    {
      type: 'number',
      title: 'Cluster Running',
      titles: "Clusters Running"
    },
    {
      type: 'number',
      title: 'Node Running',
      titles: "Nodes Running"
    },
    {
      type: 'number',
      title: 'Running Container',
      titles: 'Running Containers',
    },
    {
      type: 'number',
      title: 'Error in last 24 hours',
      titles: 'Errors in last 24 hours'
    }
  ];

  componentDidMount() {
    const {load} = this.props;

    this.state = {};

    load();
    $('.input-search').focus();
  }

  render() {
    const {clusters, clustersIds} = this.props;
    const clustersList = clustersIds !== null ? clustersIds.filter(id => !(['all', 'orphans'].includes(id))).map(id => clusters[id]) : null;
    const clustersAll = clustersIds !== null ? clustersIds.filter(id => id === 'all').map(id => clusters[id]) : null;

    let clusterCount = 0;
    let runningNodes = 0;
    let runningContainers = 0;
    let errorCount = 0;

    if (clustersList && clustersList.length > 0) {
      clusterCount = clustersList.length || 0;

      clustersAll.forEach((cluster) => {
        runningNodes += cluster.nodes.on || 0;
        runningContainers += cluster.containers.on || 0;
      });
    }

    const clustersHeaderBar = (
      <div className="clearfix">
        <h3>Clusters</h3>

        <ButtonToolbar>
          <Button
            bsStyle="primary"
            onClick={this.onActionInvoke.bind(this, "create")}
          >
            <i className="fa fa-plus" />&nbsp;
            New Cluster
          </Button>
        </ButtonToolbar>
      </div>
    );

    const eventsHeaderBar = (
      <div className="clearfix">
        <h3>Events</h3>
      </div>
    );

    return (
      <div>
        <StatisticsPanel metrics={this.statisticsMetrics}
                         values={[clusterCount, runningNodes, runningContainers, errorCount]}
        />

        <ClustersList loading={typeof clustersList === "undefined"}
                      data={clustersList}
                      onNewCluster={this.onActionInvoke.bind(this, "create")}
                      onActionInvoke={this.onActionInvoke.bind(this)}
        />

        <Panel header={eventsHeaderBar}>
          {!clustersList && (
            <ProgressBar active now={100} />
          )}
        </Panel>

        {(this.state && this.state.clusterActionDialog) && (
          <div>
            {this.state.clusterActionDialog}
          </div>
        )}
      </div>
    );
  }

  onHideDialog() {
    this.setState({
      clusterActionDialog: undefined
    });
  }

  onActionInvoke(action, cluster, event) {
    switch (action) {
      case "create":
        this.setState({
          clusterActionDialog: (
            <ClusterAdd title="Create a New Cluster"
                        cluster={undefined}
                        onHide={this.onHideDialog.bind(this)}
            />
          )
        });
        return;

      case "edit":
        this.setState({
          actionTitle: "Edit Cluster",
          clusterActionDialog: (
            <ClusterAdd title="Edit Cluster"
                        cluster={cluster}
                        onHide={this.onHideDialog.bind(this)}
            />
          )
        });
        return;

      case "information":
        this.setState({
          actionTitle: "Information",
          clusterActionDialog: (
            <ClusterAdd title="Information"
                        cluster={cluster}
                        onHide={this.onHideDialog.bind(this)}
            />
          )
        });
        return;

      case "config":
        this.setState({
          actionTitle: "Configuration",
          clusterActionDialog: (
            <ClusterAdd cluster={cluster} />
          )
        });
        return;

      case "delete":
        return;

      default:
        return;
    }
  }
}
