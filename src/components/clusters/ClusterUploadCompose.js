import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Field, reduxForm, SubmissionError} from 'redux-form';
import {uploadCompose} from 'redux/modules/clusters/clusters';
import {createValidator, required} from 'utils/validation';
import {Dialog} from 'components';
import {FormGroup, FormControl, ControlLabel, HelpBlock, Alert} from 'react-bootstrap';

@connect(state => ({
  uploadComposeError: state.clusters.uploadComposeError
}), {uploadCompose})
@reduxForm({
  form: 'ClusterUploadCompose',
  fields: [
    'name',
    'file'
  ],
  validate: createValidator({
    name: [required],
    file: [required]
  })
})
export default class ClusterUploadCompose extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    uploadCompose: PropTypes.func.isRequired,
    fields: PropTypes.object,
    handleSubmit: PropTypes.func,
    cluster: PropTypes.string.isRequired,
    resetForm: PropTypes.func,
    submitting: PropTypes.bool,
    uploadComposeError: PropTypes.string,
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

  componentDidMount() {
    const {fields, cluster} = this.props;
    if (cluster) {
      fields.name.onChange(cluster);
    }
  }

  onSubmit() {
    const {fields, uploadCompose} = this.props;
    let $logBlock = $('#creation-log-block');
    let $logBlockArea = $('#creation-log');
    let $spinner = $logBlock.find('i');
    $logBlock.show();
    $logBlockArea.val('');
    this.setState({
      creationLogVisible: true
    });
    $spinner.show();
    return uploadCompose(fields.name.value, fields.file.value[0]).then((response) => {
      const status = response._res.status || response._res.code;
      switch (status) {
        case 200:
          $logBlockArea.val(response._res.text || 'Successfully deployed');
          break;
        case 304:
          $logBlockArea.val('Not modified');
          break;
        default:
          $logBlockArea.val('Error. ' + response._res.message);
      }
      $spinner.hide();
    }).catch((response) => {
      $spinner.hide();
      $logBlockArea.val('Error ' + status);
      throw new SubmissionError(response._res.message);
    });
  }

  render() {
    const {fields, cluster} = this.props;
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
        {this.props.uploadComposeError && (
          <Alert bsStyle="danger">
            {this.props.uploadComposeError}
          </Alert>
        )}

        <form onSubmit={this.props.handleSubmit(this.onSubmit.bind(this))}>
          <FormGroup validationState={fields.name.error && fields.name.touched ? "error" : null}>
            <ControlLabel>Cluster's Name</ControlLabel>

            <FormControl type="text"
                         {...fields.name}
                         name="name"
                         id="clusterName"
                         disabled
                         defaultValue = {cluster}
            />
            {fields.name.error && fields.name.touched && (
              <HelpBlock>{fields.name.error}</HelpBlock>
            )}
          </FormGroup>

          <FormGroup validationState={fields.file.error && fileInputTouched ? "error" : null}>
            <ControlLabel className="btn btn-default btn-file">
              Choose Compose File
              <FormControl type="file"
                           name="file"
                           {...fields.file}
                           value={null}
                           id="fileInput"
                           onClick={this.showValidationErr.bind(this)}
              />
            </ControlLabel>
            <span className="upload-file-name">{fields.file.value && fileName}</span>
            {fields.file.error && fileInputTouched && (
              <HelpBlock>{fields.file.error}</HelpBlock>
            )}
          </FormGroup>
          <div className="form-group" id="creation-log-block">
            <label>Deploy Result: <i className="fa fa-spinner fa-2x fa-pulse"/></label>
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
