import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {reduxForm} from 'redux-form';
import {clusterConfig} from 'redux/modules/clusters/clusters';
import {createValidator, required} from 'utils/validation';
import {Dialog} from 'components';
import {FormGroup, FormControl, ControlLabel, HelpBlock} from 'react-bootstrap';

@connect(state => ({
  createError: state.clustersUI.createError
}), {clusterConfig})
export default class ClusterConfig extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    cluster: PropTypes.any,
    onHide: PropTypes.func.isRequired,

    clusterConfig: PropTypes.func
  };

  componentDidMount() {
    if (this.props && this.props.cluster) {
      this.props.clusterConfig(this.props.cluster);
    }
  }

  render() {
    console.log('config props', this.props);
    return (
      <Dialog show
              hideCancel
              size="large"
              title={this.props.title}
              onSubmit={this.props.onHide}
      >
        Configuration props here
        <form>
          <FormGroup>
            <FormControl componentClass="textarea"
            />
          </FormGroup>
        </form>
      </Dialog>
    );
  }
}
