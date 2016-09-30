import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Field, reduxForm, SubmissionError} from 'redux-form';
import {list, uploadFile} from 'redux/modules/application/application';
import {createValidator, required} from 'utils/validation';
import {Dialog} from 'components';
import {FormGroup, FormControl, ControlLabel, HelpBlock, Alert} from 'react-bootstrap';

@connect(state => ({
  createError: state.application.uploadFileError
}), {list, uploadFile})
@reduxForm({
  form: 'ApplicationCreate',
  fields: [
    'name',
    'file'
  ],
  validate: createValidator({
    name: [required],
    file: [required]
  })
})
export default class ApplicationCreate extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    clusterName: PropTypes.string.isRequired,
    list: PropTypes.func.isRequired,
    uploadFile: PropTypes.func.isRequired,
    loadContainers: PropTypes.func.isRequired,
    fields: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func,
    resetForm: PropTypes.func,
    submitting: PropTypes.bool,
    createError: PropTypes.string,
    valid: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired
  };

  constructor(...params) {
    super(...params);
    this.state = {
      creationLogVisible: ''
    };
  }

  onSubmit() {
    const {fields, clusterName} = this.props;
    let $logBlock = $('#creation-log-block');
    let $logBlockArea = $('#creation-log');
    let $spinner = $logBlock.find('i');
    $logBlock.show();
    $logBlockArea.val('');
    this.setState({
      creationLogVisible: true
    });
    $spinner.show();
    return this.props.uploadFile(clusterName, fields.name.value, fields.file.value[0]).then((response) => {
      $logBlockArea.val(response._res.text);
      this.props.list(clusterName);
      $spinner.hide();
    }).catch((response) => {
      $spinner.hide();
      throw new SubmissionError(response.message);
    });
  }

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
            />

            <FormControl.Feedback />
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
            <FormControl.Feedback />
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
