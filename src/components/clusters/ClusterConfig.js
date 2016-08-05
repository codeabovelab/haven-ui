import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {reduxForm} from 'redux-form';
import {load, create} from 'redux/modules/clusters/clusters';
import {createValidator, required} from 'utils/validation';
import {Dialog} from 'components';
import {FormGroup, FormControl, ControlLabel, HelpBlock} from 'react-bootstrap';

@connect(state => ({
  createError: state.clustersUI.createError
}), {create, load})
export default class ClusterConfig extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    cluster: PropTypes.any,
    onHide: PropTypes.func.isRequired
  };

  render() {
    return (
      <Dialog show
              hideCancel
              size="large"
              title={this.props.title}
              onSubmit={this.props.onHide}
      >
        Configuration props here
      </Dialog>
    );
  }
}
