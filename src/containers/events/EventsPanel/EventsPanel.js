import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import { Link } from 'react-router';
import _ from 'lodash';
import {DockTable, ClustersList, StatisticsPanel, Dialog, EventLog} from 'components';
import {Panel} from 'react-bootstrap';
import {loadContainers} from 'redux/modules/clusters/clusters';


@connect(
  state => ({
    clusters: state.clusters,
    containers: state.containers,
    events: state.events,
    alerts: state.events.alerts
  }), {
    loadContainers
  }
)
export default class EventsPanel extends Component {
  static propTypes = {
    clusters: PropTypes.object,
    containers: PropTypes.object,
    params: PropTypes.object,
    events: PropTypes.object,
    loadContainers: PropTypes.func
  };

  statisticsMetrics = [
    {
      type: 'number',
      title: 'Container Running',
      titles: 'Containers Running',
      link: '/containers'
    },
    {
      type: 'number',
      title: 'Node Running',
      titles: 'Nodes Running',
      link: '/nodes'
    },
    {
      type: 'number',
      title: 'Application',
      titles: 'Applications',
      link: '/applications'
    },
    {
      type: 'number',
      title: 'Event',
      titles: 'Events',
      link: '/events'
    }
  ];

  componentDidMount() {
    const {loadContainers, params: {name}} = this.props;
    loadContainers(name);
  }

  render() {
    const {clusters, containers, params: {name}} = this.props;
    const cluster = clusters[name];
    let events = this.props.events['bus.cluman.errors'];

    let runningContainers = 0;
    let runningNodes = 0;
    let Apps = 0;
    let eventsCount = 0;
    if (name && events && name !== 'all') {
      events = events.filter((el)=>(el.cluster === name));
    }
    if (events) {
      eventsCount = _.size(events);
    }
    if (name === 'all') {
      _.forEach(clusters, (el)=> {
        Apps += _.size(el.applications);
      });
    }else {
      Apps = _.size(cluster.applications);
    }

    if (containers && _.size(containers) > 0) {
      _.forEach(containers, (container) => {
        if (container.run && (name === 'all' || name === container.cluster)) {
          runningContainers++;
        }
      });
    }

    if (typeof(cluster.nodes.on) !== 'undefined') {
      runningNodes = cluster.nodes.on;
    }
    const eventsHeaderBar = (
      <div className="clearfix">
        <h3>Events</h3>
      </div>
    );

    return (
      <div>
        <StatisticsPanel metrics={this.statisticsMetrics}
                         link
                         cluster={cluster}
                         values={[runningContainers, runningNodes, Apps, eventsCount]}
        />
        {name && (
          <h1>
            <Link to="/clusters">Clusters</Link>/<Link to={"/clusters/" + name}>{name}</Link>/Events
          </h1>)}
        {!name && (
          <h1>
            <Link to="/clusters">Clusters</Link>/<Link to="/clusters/all">all</Link>/Events
          </h1>)}
        <Panel header={eventsHeaderBar}>
          {this.props.events && (
            <EventLog data={events}
                      loading={!this.props.events}
            />
          )}
        </Panel>
      </div>
    );
  }
}
