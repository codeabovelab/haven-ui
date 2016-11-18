import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import {Glyphicon} from 'react-bootstrap';

export default class OnOff extends Component {
  static propTypes = {
    on: PropTypes.number,
    off: PropTypes.number,
    href: PropTypes.string
  };

  render() {
    let onColor = (this.props.on > 0) ? "up-status-count" : "default-status-count";
    return (
      <p>
      <a className="on-off text-success" href={this.props.href}>
        <span className={onColor}>{this.props.on}</span>
      </a>

      {(this.props.off > 0) && (
        <a className="on-off text-danger" href={this.props.href}>
          <span className="down-status-count">{this.props.off}</span>
        </a>
      )}
      </p>
    );
  }
}
