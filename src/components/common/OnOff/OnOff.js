import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import {Glyphicon} from 'react-bootstrap';

export default class OnOff extends Component {
  static propTypes = {
    on: PropTypes.number,
    off: PropTypes.number
  };

  render() {
    return (
      <p>
        <Glyphicon glyph="chevron-up" className="text-success" />
        &nbsp;
        <a className="text-success">{this.props.on}</a>
        &nbsp;&nbsp;&nbsp;
        <Glyphicon glyph="chevron-down" className="text-danger" />
        &nbsp;
        <a className="text-danger">{this.props.off}</a>
      </p>
    );
  }
}
