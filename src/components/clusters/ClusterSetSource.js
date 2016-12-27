import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Field, reduxForm, SubmissionError} from 'redux-form';
import {setClusterSource} from 'redux/modules/clusters/clusters';
import {createValidator, required} from 'utils/validation';
import {Dialog} from 'components';
import {FormGroup, FormControl, ControlLabel, HelpBlock, Alert} from 'react-bootstrap';

@connect(state => ({
  setSourceError: state.clusters.setSourceError
}), {setClusterSource})
@reduxForm({
  form: 'ClusterSetSource',
  fields: [
    'name',
    'file'
  ],
  validate: createValidator({
    name: [required],
    file: [required]
  })
})
export default class ClusterSetSource extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    setClusterSource: PropTypes.func.isRequired,
    fields: PropTypes.object,
    cluster: PropTypes.string.isRequired,
    handleSubmit: PropTypes.func,
    resetForm: PropTypes.func,
    submitting: PropTypes.bool,
    setSourceError: PropTypes.string,
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

  componentDidMount() {
    const {fields, cluster} = this.props;
    if (cluster) {
      fields.name.onChange(cluster);
    }
  }


  onSubmit() {
    const {fields, setClusterSource, cluster} = this.props;
    let $logBlock = $('#creation-log-block');
    let $logBlockArea = $('#creation-log');
    let $spinner = $logBlock.find('i');
    let file = fields.file.value[0];

    $logBlock.show();
    $logBlockArea.val('');
    this.setState({
      creationLogVisible: true
    });
    $spinner.show();
    return setClusterSource(cluster, file).then((response) => {
      if (response._res.status === 200 && response._res.text === '') {
        $logBlockArea.val('Successfully uploaded');
      } else {
        let msg = (response._res.text && response._res.text.length > 0) ? response._res.text : "No response message";
        $logBlockArea.val(msg);
      }
      $spinner.hide();
    }).catch((response) => {
      $spinner.hide();
      throw new SubmissionError(response.message);
    });
  }

  showValidationErr() {
    this.setState({fileInputTouched: true});
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
        {this.props.setSourceError && (
          <Alert bsStyle="danger">
            {this.props.setSourceError}
          </Alert>
        )}

        <form onSubmit={this.props.handleSubmit(this.onSubmit.bind(this))}>
          <FormGroup validationState={fields.name.error ? "error" : ""}>
            <ControlLabel>Cluster's Name</ControlLabel>

            <FormControl type="text"
                         {...fields.name}
                         name="name"
                         id="clusterName"
                         disabled
                         defaultValue = {cluster}
            />
            {fields.name.error && (
              <HelpBlock>{fields.name.error}</HelpBlock>
            )}
          </FormGroup>

          <FormGroup validationState={(fields.file.error && fileInputTouched) ? "error" : ""}>
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
            {(fields.file.error && fileInputTouched) && (
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

