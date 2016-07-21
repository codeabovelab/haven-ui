import React, { Component, PropTypes} from 'react';
import config from '../../config';
import Helmet from 'react-helmet';
import {connect} from 'react-redux';
import TimeAgo from 'react-timeago';
import _ from 'lodash';
import {Row, Col, Panel} from 'react-bootstrap';

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

        <Row className="pie-charts">
          <div className="pie-chart-item-container">
            <div className="pie-chart-item">
              <Panel>
                <div className="chart" data-percent="60"> <span className="percent"></span> </div>

                <div className="description">
                  <div>Metric #1</div>
                  <div className="description-stats">Metric 1 stats</div>
                </div>

                <i className="chart-icon i-{{ ::chart.icon }}"></i>
              </Panel>
            </div>
          </div>

          <div className="pie-chart-item-container">
            <div className="pie-chart-item">
              <Panel>
                <div className="chart" data-percent="60"> <span className="percent"></span> </div>

                <div className="description">
                  <div>Metric #2</div>
                  <div className="description-stats">Metric 2 stats</div>
                </div>

                <i className="chart-icon i-{{ ::chart.icon }}"></i>
              </Panel>
            </div>
          </div>

          <div className="pie-chart-item-container">
            <div className="pie-chart-item">
              <Panel>
                <div className="chart" data-percent="60"> <span className="percent"></span> </div>

                <div className="description">
                  <div>Metric #3</div>
                  <div className="description-stats">Metric 3 stats</div>
                </div>

                <i className="chart-icon i-{{ ::chart.icon }}"></i>
              </Panel>
            </div>
          </div>

          <div className="pie-chart-item-container">
            <div className="pie-chart-item">
              <Panel>
                <div className="chart" data-percent="60"> <span className="percent"></span> </div>

                <div className="description">
                  <div>Metric #4</div>
                  <div className="description-stats">Metric 4 stats</div>
                </div>

                <i className="chart-icon i-{{ ::chart.icon }}"></i>
              </Panel>
            </div>
          </div>
        </Row>

        <div className="container-fluid">
          <div className="row">
            <div className="col-sm-6"></div>
            <div className="col-sm-6">
              {events && (
                <div className="card events">
                  <div className="card-block">
                    <h4 className="card-title">
                      <i className="fa fa-bell"/>
                      Events
                    </h4>

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
