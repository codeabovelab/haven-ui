import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import {Row, Col, Panel} from 'react-bootstrap';

export default class StatisticsPanel extends React.Component {
  static propTypes = {
    metrics: PropTypes.array,
    values: PropTypes.array
  };

  render() {
    return (
      <Row>
        {this.props.metrics && this.props.metrics.map((metric, index) => {
          return (
            <Col sm={3}>
              <Panel>
                <div className="metric-row">
                  <div className="metric-value">
                    {this.props.values[index]}
                  </div>

                  <div className="metric-label">
                    {metric.title}
                  </div>
                </div>
              </Panel>
            </Col>
          );
        })}
      </Row>
    );
  }
}
