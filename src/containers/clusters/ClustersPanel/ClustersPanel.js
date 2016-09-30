import React, {Component, PropTypes} from 'react';
import * as clusterActions from 'redux/modules/clusters/clusters';
import {connect} from 'react-redux';
import { Link } from 'react-router';
import _ from 'lodash';
import {DockTable, ClustersList, StatisticsPanel, Dialog} from '../../../components';
import {ClusterAdd, ClusterConfig, ClusterInformation} from '../../index';
import {Label, Badge, ButtonToolbar, SplitButton, MenuItem, Panel, Button, ProgressBar} from 'react-bootstrap';
import {count as countEvents} from 'redux/modules/events/events';
import {list as listApplications} from 'redux/modules/application/application';

@connect(
  state => ({
    clusters: state.clusters,
    clustersIds: state.clustersUI.list,
    alerts: state.events.alerts,
    application: state.application.applicationsList
  }), {
    loadClusters: clusterActions.load,
    deleteCluster: clusterActions.deleteCluster,
    loadNodes: clusterActions.loadNodes,
    countEvents,
    listApplications
  }
)
export default class ClustersPanel extends Component {
  static propTypes = {
    clusters: PropTypes.object,
    application: PropTypes.object,
    clustersIds: PropTypes.array,
    loadClusters: PropTypes.func.isRequired,
    deleteCluster: PropTypes.func.isRequired,
    loadNodes: PropTypes.func.isRequired,
    alerts: PropTypes.object,
    countEvents: PropTypes.func.isRequired,
    listApplications: PropTypes.func.isRequired
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
    const {loadClusters, loadNodes, countEvents, listApplications} = this.props;
    this.state = {};
    let clusterNames = [];
    loadClusters().then(() => {
      for (let key in this.props.clusters) {
        if (typeof(this.props.clusters[key] === 'Cluster')) {
          clusterNames.push('cluster:' + key);
          listApplications(key);
        }
      }
      countEvents('bus.cluman.errors', clusterNames);
    });
    loadNodes('orphans');

    $('.input-search').focus();
  }

  render() {
    const {clusters, clustersIds, alerts, application} = this.props;
    let clustersList = clustersIds !== null ? clustersIds.filter(id => !(['all', 'orphans'].includes(id))).map(id => clusters[id]) : null;
    if (clustersList) {
      clustersList = clustersList.map((element)=> {
        let alertsCount = alerts ? alerts[element.name] : 0;
        let applicationsCount;
        if (application && application[element.name]) {
          applicationsCount = _.size(application[element.name]);
        } else {
          applicationsCount = 0;
        }
        return Object.assign(element, alertsCount, {applicationsCount});
      });
    }
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
    switch (action) {
      case "create":
        this.setState({
          actionDialog: (
            <ClusterAdd title="Create a New Cluster"
                        cluster={undefined}
                        onHide={this.onHideDialog.bind(this)}
                        orphanNodes = {orphanNodes}
            />
          )
        });
        return;

      case "edit":
        let description = this.props.clusters[cluster].description;
        this.setState({
          actionDialog: (
            <ClusterAdd title="Edit Cluster"
                        cluster={cluster}
                        description={description}
                        orphanNodes = {orphanNodes}
                        onHide={this.onHideDialog.bind(this)}
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

      default:
        return;
    }
  }
}
