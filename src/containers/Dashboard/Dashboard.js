import React, { Component, PropTypes} from 'react';
import config from '../../config';
import Helmet from 'react-helmet';
import {connect} from 'react-redux';
import TimeAgo from 'react-timeago';
import _ from 'lodash';
import {Row, Col, Panel} from 'react-bootstrap';
import {DockTable, StatisticsPanel, DashboardNodesList, DashboardClustersList} from '../../components';
import {load as loadClusters} from 'redux/modules/clusters/clusters';
import {load as loadNodes} from 'redux/modules/nodes/nodes';
import {count as countEvents} from 'redux/modules/events/events';
import {list as listApplications} from 'redux/modules/application/application';

@connect(
  state => ({
    clusters: state.clusters,
    nodes: state.nodes,
    lastEvents: state.events.last,
    alerts: state.events.alerts,
    application: state.application.applicationsList
  }), {loadClusters, loadNodes, countEvents, listApplications})
export default class Dashboard extends Component {
  static propTypes = {
    lastEvents: PropTypes.array,
    clusters: PropTypes.object,
    alerts: PropTypes.object,
    nodes: PropTypes.object,
    application: PropTypes.object,
    loadClusters: PropTypes.func.isRequired,
    loadNodes: PropTypes.func.isRequired,
    countEvents: PropTypes.func.isRequired,
    listApplications: PropTypes.func.isRequired
  };

  statisticsMetrics = [
    {
      type: 'number',
      title: 'Cluster Running',
      titles: 'Clusters Running'
    },
    {
      type: 'number',
      title: 'Running Node',
      titles: 'Running Nodes'
    },
    {
      type: 'number',
      title: 'Running Container',
      titles: 'Running Containers'
    },
    {
      type: 'number',
      title: 'Errors in last 24 hour',
      titles: 'Error in last 24 hours'
    }
  ];

  componentDidMount() {
    const {loadClusters, loadNodes, countEvents, listApplications} = this.props;
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
    loadNodes();
  }

  render() {
    const {lastEvents, alerts, application} = this.props;
    let events = lastEvents ? lastEvents.slice(0, 20) : null;

    const styles = require('./Dashboard.scss');
    // require the logo image both from client and server
    const logoImage = require('./logo.png');

    let activeClusters = 0;
    let runningNodes = 0;
    let runningContainers = 0;
    const errorCount = 0;

    let top5Memory = [];
    let top5CPU = [];
    let top5Network = [];

    let clustersList = Object.values(this.props.clusters).filter((cluster) => (cluster.features && cluster.features.includes("SWARM")));
    let clustersAll = Object.values(this.props.clusters).filter((cluster) => cluster.name === 'all');

    if (this.props.clusters) {
      const clusters = clustersList;
      //console.log('clusters', clusters);
      activeClusters = clusters.length;
    }

    clustersAll.forEach((cluster) => {
      runningContainers += cluster.containers.on || 0;
    });

    if (this.props.nodes) {
      const nodes = Object.values(this.props.nodes);
      //console.log('nodes', nodes);
      top5Memory = nodes.filter((el) => {
        if (typeof el.health !== "undefined" && el.on === true) {
          return true;
        }
      }).sort((a, b) => {
        runningNodes += 1;
        if (a.health.sysMemUsed > b.health.sysMemUsed) {
          return -1;
        } else if (a.health.sysMemUsed < b.health.sysMemUsed) {
          return 1;
        }

        return 0;
      });

      top5CPU = nodes.filter((el) => {
        if (typeof el.health !== "undefined" && el.on === true) {
          return true;
        }
      }).map((element)=> {
        if (typeof(element.health.sysCpuLoad) === 'undefined') {
          element.health.sysCpuLoad = 0;
        }
        return element;
      }).sort((a, b) => {
        if (a.health.sysCpuLoad > b.health.sysCpuLoad) {
          return -1;
        } else if (a.health.sysCpuLoad < b.health.sysCpuLoad) {
          return 1;
        }

        return 0;
      });

      top5Network = nodes.filter((el) => {
        if (typeof el.health !== "undefined" && el.on === true) {
          return true;
        }
      }).sort((a, b) => {
        if (a.health.netTotal > b.health.netTotal) {
          return -1;
        } else if (a.health.netTotal < b.health.netTotal) {
          return 1;
        }

        return 0;
      });
    }

    let clusters;
    if (this.props.clusters) {
      clusters = clustersList.map((element)=> {
        let alertsCount = alerts ? alerts[element.name] : 0;
        let applicationsList;
        if (application && application[element.name]) {
          applicationsList = _.keys(application[element.name]);
        } else {
          applicationsList = '';
        }
        return Object.assign(element, alertsCount, {applicationsList});
      });
    }

    return (
      <div className={styles.home}>
        <Helmet title="Home"/>

        <StatisticsPanel metrics={this.statisticsMetrics}
                         values={[activeClusters, runningNodes, runningContainers, errorCount]}
        />

        <DashboardClustersList loading={typeof this.props.clusters === "undefined"}
                               data={clusters}
        />

        <Row>
          <Col sm={4}>
            <DashboardNodesList title="Top 5 Memory Usage Nodes"
                                count={5}
                                metric="sysMemUsed"
                                metricTitle="Memory Usage"
                                data={top5Memory}
            />
          </Col>

          <Col sm={4}>
            <DashboardNodesList title="Top 5 CPU Usage Nodes"
                                count={5}
                                metric="sysCpuLoad"
                                metricTitle="CPU Usage"
                                data={top5CPU}
            />
          </Col>

          <Col sm={4}>
            <DashboardNodesList title="Top 5 Network Usage Nodes"
                                count={5}
                                metric="networkIO"
                                metricTitle="Network (I/O)"
                                data={top5Network}
            />
          </Col>
        </Row>
      </div>
    );
  }

  renderEvent(event, i) {
    if (event.info) {
      return this.renderInfoEvent(event, i);
    }
    return <li className="list-group-item"/>;
  }

  renderInfoEvent(event, i) {
    let info = event.info;
    return (<li key={i} className="list-group-item">
      <div>
        <strong>{info.name}</strong>&nbsp;
        {JSON.stringify(_.omit(info, ['name', 'created']))}
      </div>
      <div className="text-xs-right">
        <small className="text-muted"><TimeAgo date={event.created}/></small>
      </div>
    </li>);
  }
}
