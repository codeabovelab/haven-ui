import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Field, reduxForm, SubmissionError} from 'redux-form';
import {list, uploadFile} from 'redux/modules/application/application';
import {createValidator, required} from 'utils/validation';
import {Dialog} from 'components';
import {FormGroup, FormControl, ControlLabel, HelpBlock, Alert} from 'react-bootstrap';

export default class UploadSettings extends Component {


  render() {
    const {fields} = this.props;
    const creationLogVisible = this.state.creationLogVisible;
    const fileInputVal = $('#fileInput').val();
    const fileName = fileInputVal ? fileInputVal.match(/[^\\\/]+$/g) : '';
    return (
      <Dialog show
              size="large"
              title={this.props.title}
              submitting={this.props.submitting}
              allowSubmit={this.props.valid}
              onReset={this.props.resetForm}
              onSubmit={creationLogVisible ? this.props.onHide : this.props.handleSubmit(this.onSubmit.bind(this))}
              onHide={creationLogVisible ? this.props.handleSubmit(this.onSubmit.bind(this)) : this.props.onHide}
              okTitle={creationLogVisible ? "Close" : null}
              cancelTitle={creationLogVisible ? "Again" : null}
      >
        {this.props.createError && (
          <Alert bsStyle="danger">
            {this.props.createError}
          </Alert>
        )}

        <form onSubmit={this.props.handleSubmit(this.onSubmit.bind(this))}>
          <FormGroup validationState={fields.name.error ? "error" : ""}>
            <ControlLabel>Name</ControlLabel>

            <FormControl type="text"
                         {...fields.name}
                         name="name"
                         id="appName"
                         disabled={application ? true : false}
            />
            {fields.name.error && (
              <HelpBlock>{fields.name.error}</HelpBlock>
            )}
          </FormGroup>

          <FormGroup validationState={fields.file.error ? "error" : ""}>
            <ControlLabel className="btn btn-default btn-file">
              Choose Compose File
              <FormControl type="file"
                           name="file"
                           {...fields.file}
                           value={null}
                           id="fileInput"
              />
            </ControlLabel>
            <span className="upload-file-name">{fields.file.value && fileName}</span>
            {fields.file.error && (
              <HelpBlock>{fields.file.error}</HelpBlock>
            )}
          </FormGroup>
          <div className="form-group" id="creation-log-block">
            <label>Creation Log: <i className="fa fa-spinner fa-2x fa-pulse"/></label>
            <textarea readOnly
                      className="container-creation-log"
                      defaultValue=""
                      id="creation-log"
            />
          </div>
        </form>
      </Dialog>
    );
  }

}