import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import { asyncConnect } from 'redux-async-connect';
import { Link, RouteHandler } from 'react-router';
import _ from 'lodash';
import {DockTable, ClustersList, StatisticsPanel, Dialog, EventLog, NavContainer} from 'components';
import * as clusterActions from 'redux/modules/clusters/clusters';
import Helmet from 'react-helmet';

@asyncConnect([{
  promise: ({store: {dispatch, getState}}) => {
    const promises = [];

    if (!clusterActions.isLoaded(getState())) {
      promises.push(dispatch(clusterActions.load()));
    }
    return Promise.all(promises);
  }
}])
@connect(
  state => ({
    clusters: state.clusters,
    containers: state.containers,
    events: state.events,
    alerts: state.events.alerts,
    token: state.auth.token
  }), {
    loadContainers: clusterActions.loadContainers
  }
)
export default class EventsPanel extends Component {
  static propTypes = {
    clusters: PropTypes.object,
    containers: PropTypes.object,
    params: PropTypes.object,
    events: PropTypes.object,
    loadContainers: PropTypes.func,
    token: PropTypes.object,
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
    const {loadContainers, params: {name}, token, params: {subname}} = this.props;
    loadContainers(name);
  }

  render() {
    const {clusters, containers, params: {name}, params: {subname}} = this.props;
    const cluster = clusters[name];
    let events = this.props.events['bus.cluman.errors-stats'];
    let runningContainers = 0;
    let runningNodes = 0;
    let Apps = 0;
    let uniqueEvents = [];
    let eventsCount = 0;
    if (name && events && name !== 'all') {
      events = _.filter(events, (el)=>(el.lastEvent.cluster === name));
    } else {
      events = _.filter(events, (el)=>(el.lastEvent.cluster !== 'undefined'));
    }
    if (clusters && cluster) {
      if (events) {
        _.forEach(events, (value, key) => {
          uniqueEvents[key] = {...value.lastEvent, count: value.count};
          eventsCount += value.count;
        });
      }

      if (name === 'all') {
        _.forEach(clusters, (el)=> {
          Apps += _.size(el.applications);
        });
      } else {
        Apps = _.size(cluster.applications);
      }
      if (cluster.nodes && typeof(cluster.nodes.on) !== 'undefined') {
        runningNodes = cluster.nodes.on;
      }
    }

    if (containers && _.size(containers) > 0) {
      _.forEach(containers, (container) => {
        if (container.run && (name === 'all' || name === container.cluster)) {
          runningContainers++;
        }
      });
    }

    return (
      <div>
        <Helmet title="Events"/>
        {cluster && (
          <StatisticsPanel metrics={this.statisticsMetrics}
                           cluster={cluster}
                           values={[runningContainers, runningNodes, Apps, eventsCount]}
          />
        )}
        <div className="panel panel-default">
          <NavContainer clusterName={name}/>
          {this.props.events && (
            <EventLog data={uniqueEvents}
                      loading={!this.props.events}
                      statistics
            />
          )}
        </div>
      </div>
    );
  }
}
