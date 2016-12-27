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
    application: PropTypes.object,
    valid: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired
  };

  constructor(...params) {
    super(...params);
    this.state = {
      creationLogVisible: ''
    };
  }

  componentDidMount() {
    const {application, fields} = this.props;
    if (application) {
      fields.name.onChange(application.name);
    }
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
      let msg = (response._res.text && response._res.text.length > 0) ? response._res.text : "No response message";
      $logBlockArea.val(msg);
      this.props.list(clusterName);
      $spinner.hide();
    }).catch((response) => {
      $spinner.hide();
      throw new SubmissionError(response.message);
    });
  }

  render() {
    const {fields, application} = this.props;
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
            <label>Create Log: <i className="fa fa-spinner fa-2x fa-pulse"/></label>
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
