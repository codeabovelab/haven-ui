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
    let filePath = URL.createObjectURL(file);

    $logBlock.show();
    $logBlockArea.val('');
    this.setState({
      creationLogVisible: true
    });
    $spinner.show();
    // return setClusterSource(cluster, file).then((response) => {
    //   if (response._res.status === 200 && response._res.text === '') {
    //     $logBlockArea.val('Successfully uploaded');
    //   } else {
    //     $logBlockArea.val(response._res.text);
    //   }
    //   $spinner.hide();
    // }).catch((response) => {
    //   $spinner.hide();
    //   throw new SubmissionError(response.message);
    // });
    // let content = '';
    // $.get(filePath, (data) => {
    //   content = data;
    //   console.log(content);
    // });
    $.getJSON(filePath, function setClusterSourceCallback(data) {
      return setClusterSource(cluster, data).set({ 'API-Key': 'foobar', Accept: 'application/json' }).then((response) => {
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
    }).fail((data)=> {
      console.log(data);
      console.log( "error getting JSON" );
      return setClusterSource(cluster, data.responseText).then((response) => {
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
    const {fields, cluster} = this.props;
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

