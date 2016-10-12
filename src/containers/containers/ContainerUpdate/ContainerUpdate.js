import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Dialog} from 'components';
import {reduxForm, SubmissionError} from 'redux-form';
import {create, updateContainer, loadDetails} from 'redux/modules/containers/containers';
import {loadNodes, loadContainers, loadDefaultParams} from 'redux/modules/clusters/clusters';
import {loadImages, loadImageTags, searchImages} from 'redux/modules/images/images';
import {Alert, Accordion, Panel, Label} from 'react-bootstrap';
import _ from 'lodash';
import Select from 'react-select';

@connect(state => ({
  clusters: state.clusters,
  containers: state.containers,
  containersUI: state.containersUI
}), {updateContainer, loadContainers, loadDetails})
@reduxForm({
  form: 'updateContainer',
  fields: ['bilkioWeight', 'cpuPeriod', 'cpuQuota', 'cpuShares', 'cpusetCpus', 'cpusetMems', 'kernelMemory', 'memory', 'memoryReservation']
})
export default class ContainerUpdate extends Component {
  static propTypes = {
    clusters: PropTypes.object.isRequired,
    container: PropTypes.object.isRequired,
    containers: PropTypes.array.isRequired,
    containersUI: PropTypes.object.isRequired,
    updateContainer: PropTypes.func.isRequired,
    fields: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func,
    resetForm: PropTypes.func.isRequired,
    loadContainers: PropTypes.func.isRequired,
    loadDetails: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,

    onHide: PropTypes.func.isRequired
  };

  constructor(...params) {
    super(...params);
    this.state = {
      creationLogVisible: ''
    };
  }

  componentWillMount() {
    const {loadDetails, container} = this.props;
    loadDetails(container);
  }

  onSubmit() {
    const {fields, updateContainer} = this.props.fields;
    updateContainer();
  }

  render() {
    let s = require('./ContainerUpdate.scss');
    const {clusters, fields, containersUI, container, containers} = this.props;
    console.log(containersUI);
    const creationLogVisible = this.state.creationLogVisible;
    let updating = containersUI.updating;

    return (
      <Dialog show
              size="large"
              title="Update Container"
              onSubmit={creationLogVisible ? this.props.onHide : this.props.handleSubmit(this.onSubmit.bind(this))}
              onHide={creationLogVisible ? this.props.handleSubmit(this.onSubmit.bind(this)) : this.props.onHide}
              okTitle={creationLogVisible ? "Close" : null}
              cancelTitle={creationLogVisible ? "Again" : null}
      >
        <form>
          <div className="form-group">
          </div>
        </form>
      </Dialog>
    );
  }
}


