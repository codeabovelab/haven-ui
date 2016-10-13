import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import {Row, Col, Panel} from 'react-bootstrap';
import {Link} from 'react-router';

export default class StatisticsPanel extends React.Component {
  static propTypes = {
    metrics: PropTypes.array,
    values: PropTypes.array,
    link: PropTypes.bool,
    cluster: PropTypes.object
  };

  render() {
    return (
      <Row>
        {this.props.metrics && this.props.metrics.map((metric, index) => {
          return (
            <Col sm={3} key={index}>
              <Panel>
                <div className="metric-row">
                  <div className="metric-value">
                    {this.props.values[index]}
                  </div>
                  {!this.props.link && (<div className="metric-label">
                    {this.props.values[index] > 1 ? metric.titles : metric.title}
                  </div>)}
                  {this.props.link && (this.renderLink(metric, index))}
                </div>
              </Panel>
            </Col>
          );
        })}
      </Row>
    );
  }

  renderLink(metric, index) {
    let cluster = this.props.cluster;
    console.log(cluster);
    let href = '';
    switch (metric.link) {
      case '/containers':
        href = '/clusters/' + cluster.name;
        break;
      case '/nodes':
        href = cluster.name === 'all' ? '/nodes' : '/clusters/' + cluster.name + '/nodes';
        break;
      case '/jobs':
        href = '/jobs';
        break;
      case '/applications':
        href = '/clusters/' + cluster.name + '/applications';
        break;
      case '/events':
        href = '/clusters/' + cluster.name + '/events';
        break;
      default:
        break;
    }
    return (
      <div className="metric-label"><Link to={href}>{this.props.values[index] > 1 ? metric.titles : metric.title}</Link></div>
    );
  }
}
