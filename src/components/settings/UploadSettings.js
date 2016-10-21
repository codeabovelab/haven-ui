import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Field, reduxForm, SubmissionError} from 'redux-form';
import {setSettings} from 'redux/modules/settings/settings';
import {createValidator, required} from 'utils/validation';
import {Dialog} from 'components';
import {FormGroup, FormControl, ControlLabel, HelpBlock, Alert} from 'react-bootstrap';

@connect(state => ({
  uploadError: state.settings.setSettingsError
}), {setSettings})
@reduxForm({
  form: 'UploadSettings',
  fields: [
    'file'
  ],
  validate: createValidator({
    file: [required]
  })
})
export default class UploadSettings extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    setSettings: PropTypes.func.isRequired,
    fields: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func,
    resetForm: PropTypes.func,
    submitting: PropTypes.bool,
    uploadError: PropTypes.string,
    valid: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired
  };

  constructor(...params) {
    super(...params);
    this.state = {
      creationLogVisible: '',
      fileInputTouched: false
    };
  }

  showValidationErr() {
    this.setState({fileInputTouched: true});
  }

  onSubmit() {
    const {fields, setSettings} = this.props;
    let $logBlock = $('#creation-log-block');
    let $logBlockArea = $('#creation-log');
    let $spinner = $logBlock.find('i');
    let file = fields.file.value[0];
    let filePath = URL.createObjectURL(file);
    $logBlock.show();
    $logBlockArea.val('');
    this.setState({
      creationLogVisible: true
    });
    $spinner.show();

    $.getJSON(filePath, function uploadSettingsCallback(data) {
      return setSettings(data).then((response) => {
        if (response._res.status === 200 && response._res.text === '') {
          $logBlockArea.val('Settings were successfully uploaded!');
        } else {
          $logBlockArea.val(response._res.text);
        }
        $spinner.hide();
      }).catch((response) => {
        $spinner.hide();
        throw new SubmissionError(response.message);
      });
    });
  }
  render() {
    const {fields} = this.props;
    const fileInputTouched = this.state.fileInputTouched;
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
        {this.props.uploadError && (
          <Alert bsStyle="danger">
            {this.props.uploadError}
          </Alert>
        )}

        <form onSubmit={this.props.handleSubmit(this.onSubmit.bind(this))}>
            <FormGroup validationState={(fields.file.error && fileInputTouched) ? "error" : ""}>
            <ControlLabel className="btn btn-default btn-file">
              Select a Local File
              <FormControl type="file"
                           name="file"
                           {...fields.file}
                           value={null}
                           id="fileInput"
                           onClick={this.showValidationErr.bind(this)}
              />
            </ControlLabel>
            <span className="upload-file-name">{fields.file.value && fileName}</span>
            {(fields.file.error && fileInputTouched) && (
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
