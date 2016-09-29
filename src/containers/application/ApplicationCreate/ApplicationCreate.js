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

  onSubmit() {
    const {fields, clusterName} = this.props;
    debugger;
    return this.props.uploadFile(clusterName, fields.name.value, fields.file.value[0]).then(() => {
      this.props.list(clusterName);
    }).then(() => {
      this.props.onHide();
    })
      .catch((response) => {
        throw new SubmissionError(response.message);
      });
  }

  render() {
    const {fields} = this.props;
    let {clusterName} = this.props;
    return (
      <Dialog show
              size="large"
              title={this.props.title}
              submitting={this.props.submitting}
              allowSubmit={this.props.valid}
              onReset={this.props.resetForm}
              onSubmit={this.props.handleSubmit(this.onSubmit.bind(this))}
              onHide={this.props.onHide}
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
            <ControlLabel>Compose File</ControlLabel>

            <FormControl type="file"
                         webkitdirectory
                         name="file"
                         multiple
                         {...fields.file}
                         value={null}
            />

            <FormControl.Feedback />
            {fields.file.error && (
              <HelpBlock>{fields.file.error}</HelpBlock>
            )}
          </FormGroup>
        </form>
      </Dialog>
    );
  }
}
