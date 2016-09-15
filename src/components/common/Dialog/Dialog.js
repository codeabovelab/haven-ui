import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Modal, Button, Alert} from 'react-bootstrap';

export default class Dialog extends Component {
  DEFAULT_DIALOG_SIZE = "large";
  DEFAULT_OK_TITLE = "OK";
  DEFAULT_CANCEL_TITLE = "Cancel";

  static propTypes = {
    show: PropTypes.bool.isRequired,
    backdrop: PropTypes.bool,
    focus: PropTypes.bool,
    title: PropTypes.string.isRequired,
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
    onSubmit: PropTypes.func,
    onReset: PropTypes.func,

    allowSubmit: PropTypes.bool,
    submitting: PropTypes.bool,

    hideOk: PropTypes.bool,
    hideCancel: PropTypes.bool,
    hideFooter: PropTypes.bool,

    okTitle: PropTypes.string,
    cancelTitle: PropTypes.string,

    children: PropTypes.any.isRequired,
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

        {!this.props.hideFooter && (<Modal.Footer>
          {!this.props.hideOk && (
            <Button bsStyle="primary"
                    disabled={this.props.submitting || (typeof this.props.allowSubmit !== "undefined" && !this.props.allowSubmit)}
                    onClick={this.props.onSubmit}
            >
              {this.props.okTitle || this.DEFAULT_OK_TITLE}
            </Button>
          )}

          {!this.props.hideCancel && (
            <Button bsStyle="default"
                    disabled={this.props.submitting}
                    onClick={this.props.onHide}
            >
              {this.props.cancelTitle || this.DEFAULT_CANCEL_TITLE}
            </Button>
          )}
        </Modal.Footer> )}
      </Modal>
    );
  }
}
