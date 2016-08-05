import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Modal, Button, Alert} from 'react-bootstrap';

export default class Dialog extends Component {
  static DEFAULT_DIALOG_SIZE = "large";

  static propTypes = {
    show: PropTypes.bool.isRequired,
    backdrop: PropTypes.bool,
    focus: PropTypes.bool,
    title: PropTypes.string.required,
    size: PropTypes.string,
    errors: PropTypes.array,
    messages: PropTypes.array,

    onEnter: PropTypes.func,
    onEntered: PropTypes.func,
    onEntering: PropTypes.func,
    onExit: PropTypes.func,
    onExiting: PropTypes.func,
    onExited: PropTypes.func,
    onHide: PropTypes.func,

    children: PropTypes.object.isRequired,
  };

  render() {
    return (
      <Modal show={this.props.show}
             bsSize={this.props.size || this.DEFAULT_DIALOG_SIZE}
             backdrop={this.props.focus || true}
             enforceFocus={this.props.focus || true}
             onEnter={this.props.onEnter}
             onEntered={this.props.onEntered}
             onEntering={this.props.onEntering}
             onExit={this.props.onExit}
             onExiting={this.props.onExiting}
             onExited={this.props.onExited}
             onHide={this.props.onHide}
             keyboard
      >

        <Modal.Header closeButton>
          <Modal.Title>
            {this.props.title}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {this.props.messages && this.props.messages.map((message) =>
            <Alert bsStyle="info">
              {message}
            </Alert>
          )}

          {this.props.errors && this.props.errors.map((error) =>
            <Alert bsStyle="danger">
              {error}
            </Alert>
          )}

          {this.props.children}
        </Modal.Body>

        <Modal.Footer>
          <Button>OK</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
