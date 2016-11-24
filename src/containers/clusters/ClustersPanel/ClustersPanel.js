import React, {Component, PropTypes} from 'react';
import * as clusterActions from 'redux/modules/clusters/clusters';
import {connect} from 'react-redux';
import { Link } from 'react-router';
import _ from 'lodash';
import {DockTable, ClustersList, StatisticsPanel, Dialog, EventLog} from 'components';
import {ClusterAdd, ClusterConfig, ClusterInformation} from '../../index';
import {Label, Badge, ButtonToolbar, SplitButton, MenuItem, Panel, Button, ProgressBar} from 'react-bootstrap';
import {count as countEvents} from 'redux/modules/events/events';
import {deleteClusterImages} from 'redux/modules/images/images';

@connect(
  state => ({
    clusters: state.clusters,
    clustersIds: state.clustersUI.list,
    events: state.events,
    alerts: state.events.alerts,
    users: state.users
  }), {
    loadClusters: clusterActions.load,
    deleteCluster: clusterActions.deleteCluster,
    loadNodes: clusterActions.loadNodes,
    countEvents,
    deleteClusterImages
  }
)
export default class ClustersPanel extends Component {
  static propTypes = {
    clusters: PropTypes.object,
    clustersIds: PropTypes.array,
    loadClusters: PropTypes.func.isRequired,
    deleteCluster: PropTypes.func.isRequired,
    loadNodes: PropTypes.func.isRequired,
    events: PropTypes.object,
    alerts: PropTypes.object,
    countEvents: PropTypes.func.isRequired,
    deleteClusterImages: PropTypes.func.isRequired,
    users: PropTypes.object
  };

  statisticsMetricsNodesUp = [
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

  statisticsMetricsNodesDown = [
    {
      type: 'number',
      title: 'Cluster Running',
      titles: "Clusters Running"
    },
    {
      type: 'number',
      title: 'Node Down',
      titles: "Nodes Down",
      highlight: true
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
    const {loadClusters, loadNodes, countEvents} = this.props;
    this.state = {};
    let clusterNames = [];
    loadClusters().then(() => {
      for (let key in this.props.clusters) {
        if (typeof(this.props.clusters[key] === 'Cluster')) {
          clusterNames.push('cluster:' + key);
        }
      }
      countEvents('bus.cluman.errors', clusterNames);
    });
    loadNodes('orphans');

    $('.input-search').focus();
  }

  render() {
    const {clusters, clustersIds, alerts} = this.props;
    let clustersList = clustersIds !== null ? clustersIds.filter(id => !(['all', 'orphans'].includes(id))).map(id => clusters[id]) : null;
    if (clustersList) {
      clustersList = clustersList.map((element)=> {
        let alertsCount = alerts ? alerts[element.name] : 0;
        return Object.assign(element, alertsCount);
      });
    }
    const clustersAll = clustersIds !== null ? clustersIds.filter(id => id === 'all').map(id => clusters[id]) : null;

    let clusterCount = 0;
    let runningNodes = 0;
    let downNodes = 0;
    let runningContainers = 0;
    let errorCount = 0;

    if (clustersList && clustersList.length > 0) {
      clusterCount = clustersList.length || 0;
      clustersAll.forEach((cluster) => {
        runningNodes += cluster.nodes.on || 0;
        downNodes += cluster.nodes.off || 0;
        runningContainers += cluster.containers.on || 0;
      });
    }

    const eventsHeaderBar = (
      <div className="clearfix">
        <h3>Events</h3>
      </div>
    );

    return (
      <div>
        <ul className="breadcrumb">
          <li className="active">Clusters</li>
        </ul>
        {(runningNodes > 0 || runningNodes === downNodes) && (
          <StatisticsPanel metrics={this.statisticsMetricsNodesUp}
                           values={[clusterCount, runningNodes, runningContainers, errorCount]}
          />
        )}
        {(runningNodes === 0 && downNodes > 0) && (
          <StatisticsPanel metrics={this.statisticsMetricsNodesDown}
                           values={[clusterCount, downNodes, runningContainers, errorCount]}
          />
        )}
        <ClustersList loading={typeof clustersList === "undefined"}
                      data={clustersList}
                      onNewCluster={this.onActionInvoke.bind(this, "create")}
                      onActionInvoke={this.onActionInvoke.bind(this)}
                      currentUserRole={_.get(this.props.users, 'currentUser.role', '')}
        />

        <Panel header={eventsHeaderBar}>
          {this.props.events && (
            <EventLog data={this.props.events['bus.cluman.errors']}
                      loading={!this.props.events}
            />
          )}
        </Panel>

        {(this.state && this.state.actionDialog) && (
          <div>
            {this.state.actionDialog}
          </div>
        )}
      </div>
    );
  }

  onHideDialog() {
    this.setState({
      actionDialog: undefined
    });
  }

  onActionInvoke(action, cluster, event) {
    let orphanNodes = [].concat(this.props.clusters.orphans.nodesList);
    let clustersNames = _.keys(this.props.clusters);

    switch (action) {
      case "create":
        this.setState({
          actionDialog: (
            <ClusterAdd title="Create Cluster"
                        cluster={undefined}
                        onHide={this.onHideDialog.bind(this)}
                        orphanNodes = {orphanNodes}
                        okTitle="Create Cluster"
                        existingClusters={clustersNames}
            />
          )
        });
        return;

      case "edit":
        let description = this.props.clusters[cluster].description;
        let registries = this.props.clusters[cluster].config.registries;
        this.setState({
          actionDialog: (
            <ClusterAdd title="Edit Cluster"
                        cluster={cluster}
                        description={description}
                        orphanNodes = {orphanNodes}
                        onHide={this.onHideDialog.bind(this)}
                        okTitle="Update Cluster"
                        ownRegistries = {registries}
                        existingClusters={clustersNames}
            />
          )
        });
        return;

      case "information":
        this.setState({
          actionDialog: (
            <ClusterInformation title="Information"
                                cluster={cluster}
                                onHide={this.onHideDialog.bind(this)}
            />
          )
        });
        return;

      case "config":
        this.setState({
          actionDialog: (
            <ClusterConfig title="Configuration"
                           cluster={cluster}
                           onHide={this.onHideDialog.bind(this)}
            />
          )
        });
        return;

      case "delete":
        confirm('Are you sure you want to remove this cluster?')
          .then(() => {
            this.props.deleteCluster(cluster).catch(() => null)
              .then(() => this.props.loadClusters(), this.props.loadNodes('orphans'));
          })
          .catch(() => null);// confirm cancel
        return;

      case "deleteImages":
        confirm("Are you sure you want to delete unused images in cluster " + cluster + "?")
          .then(() => {
            this.props.deleteClusterImages(cluster).catch(() => null);
          })
          .catch(() => null);
        return;

      default:
        return;
    }
  }
}
