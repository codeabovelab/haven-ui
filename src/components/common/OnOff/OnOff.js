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
        <a className="on-off text-success" href="">
          <Glyphicon glyph="chevron-up" className="text-success" />
          &nbsp;
          {this.props.on}
        </a>

        &nbsp;&nbsp;&nbsp;
        {(this.props.off > 0) && (
        <a className="on-off text-danger" href="">
          <Glyphicon glyph="chevron-down" className="text-danger" />
          &nbsp;
          {this.props.off}
        </a>
        )}
      </p>
    );
  }
}
