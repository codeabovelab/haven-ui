import React, { Component, PropTypes} from 'react';
import config from '../../config';
import Helmet from 'react-helmet';
import {connect} from 'react-redux';
import TimeAgo from 'react-timeago';
import _ from 'lodash';
import {Row, Col, Panel} from 'react-bootstrap';
import {DockTable, StatisticsPanel, DashboardNodesList} from '../../components';
import {load as loadClusters} from 'redux/modules/clusters/clusters';
import {load as loadNodes} from 'redux/modules/nodes/nodes';

@connect(
  state => ({
    clusters: state.clusters,
    nodes: state.nodes,
    lastEvents: state.events.last
  }), {loadClusters, loadNodes})
export default class Dashboard extends Component {
  static propTypes = {
    lastEvents: PropTypes.array,
    clusters: PropTypes.object,
    nodes: PropTypes.object,
    loadClusters: PropTypes.func.isRequired,
    loadNodes: PropTypes.func.isRequired
  };

  statisticsMetrics = [
    {
      type: 'number',
      title: 'Clusters Running'
    },
    {
      type: 'number',
      title: 'Running Nodes'
    },
    {
      type: 'number',
      title: 'Running Containers'
    },
    {
      type: 'number',
      title: 'Errors in last 24 hours'
    }
  ];

  componentDidMount() {
    const {loadClusters, loadNodes} = this.props;

    loadClusters();
    loadNodes();
  }

  render() {
    console.log(this.props);

    const {lastEvents} = this.props;
    let events = lastEvents ? lastEvents.slice(0, 20) : null;

    const styles = require('./Dashboard.scss');
    // require the logo image both from client and server
    const logoImage = require('./logo.png');

    const activeclusters = 0;
    let runningNodes = 0;
    const runningContainers = 0;
    const errorCount = 0;

    let top5Memory = [];
    let top5CPU = [];
    let top5Network = [];

    if (this.props.nodes) {
      const nodes = Object.values(this.props.nodes);

      console.log('nodes', nodes);
      top5Memory = nodes.filter((el) => typeof el.health !== "undefined").sort((a, b) => {
        if (a.health.sysMemUsed > b.health.sysMemUsed) {
          return -1;
        } else if (a.health.sysMemUsed < b.health.sysMemUsed) {
          return 1;
        }

        return 0;
      });

      top5CPU = nodes.filter((el) => typeof el.health !== "undefined").sort((a, b) => {
        if (a.health.sysCpuLoad > b.health.sysCpuLoad) {
          return -1;
        } else if (a.health.sysCpuLoad < b.health.sysCpuLoad) {
          return 1;
        }

        return 0;
      });

      runningNodes = nodes.length;
    }

    return (
      <div className={styles.home}>
        <Helmet title="Home"/>

        <StatisticsPanel metrics={this.statisticsMetrics}
                         values={[activeclusters, runningNodes, runningContainers, errorCount]}
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
                                metric="sysMemUsed"
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
