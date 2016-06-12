import React, { Component, PropTypes} from 'react';
import config from '../../config';
import Helmet from 'react-helmet';
import {connect} from 'react-redux';
import TimeAgo from 'react-timeago';
import _ from 'lodash';

@connect(
  state => ({
    lastEvents: state.events.last
  }))
export default class Dashboard extends Component {
  static propTypes = {
    lastEvents: PropTypes.array
  };

  render() {
    const {lastEvents} = this.props;
    let events = lastEvents ? lastEvents.slice(0, 20) : null;

    const styles = require('./Dashboard.scss');
    // require the logo image both from client and server
    const logoImage = require('./logo.png');
    return (
      <div className={styles.home}>
        <Helmet title="Home"/>
        <div className={styles.masthead}>
          <div className="container">
            <div className={styles.logo}>
              <p>
                <img src={logoImage}/>
              </p>
            </div>
            <h1>{config.app.title}</h1>

          </div>
        </div>

        <div className="container-fluid">
          <div className="row">
            <div className="col-sm-6"></div>
            <div className="col-sm-6">
              {events &&
              (<div className="card events">
                  <div className="card-block">
                    <h4 className="card-title"><i className="fa fa-bell"/> Events</h4>
                    <ul className="list-group list-group-flush">
                      {events.map(this.renderEvent.bind(this))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderEvent(event) {
    if (event.info) {
      return this.renderInfoEvent(event);
    }
    return <li className="list-group-item"/>;
  }

  renderInfoEvent(event) {
    let info = event.info;
    return (<li className="list-group-item">
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
