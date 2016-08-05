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

    children: PropTypes.object.isRequired,

    create: PropTypes.func.isRequired,
    load: PropTypes.func.isRequired,
    fields: PropTypes.object.isRequired,
    resetForm: PropTypes.func.isRequired,
    createError: PropTypes.string,
    cluster: PropTypes.object
  };

  render() {
    return (
      <Modal show={this.props.show}
             bsSize={this.props.size || this.DEFAULT_DIALOG_SIZE}
             backdrop={this.props.focus || true}
             enforceFocus={this.props.focus || true}
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
