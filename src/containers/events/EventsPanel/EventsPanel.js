import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import { Link } from 'react-router';
import _ from 'lodash';
import {DockTable, ClustersList, StatisticsPanel, Dialog, EventLog} from 'components';
import {Panel} from 'react-bootstrap';
import {count as countEvents} from 'redux/modules/events/events';


@connect(
  state => ({
    events: state.events,
    alerts: state.events.alerts
  }), {
    countEvents
  }
)
export default class EventsPanel extends Component {
  static propTypes = {
    params: PropTypes.object,
    events: PropTypes.object
  };

  statisticsMetrics = [
    {
      type: 'number',
      title: 'Event in the Cluster',
      titles: 'Events in the Cluster'
    }
  ];

  render() {
    const {params: {name}} = this.props;
    let events = this.props.events['bus.cluman.errors'];
    let eventsCount = 0;
    if (name && events && name !== 'all') {
      events = events.filter((el)=>(el.cluster === name));
    }
    if (events) {
      eventsCount = _.size(events);
    }
    const eventsHeaderBar = (
      <div className="clearfix">
        <h3>Events</h3>
      </div>
    );

    return (
      <div>
        <StatisticsPanel metrics={this.statisticsMetrics}
                         values={[eventsCount]}
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
