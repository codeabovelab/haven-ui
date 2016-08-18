import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {clusterConfig} from 'redux/modules/clusters/clusters';
import {Dialog, PropertyGrid} from 'components';
import {FormGroup, FormControl, ControlLabel, HelpBlock} from 'react-bootstrap';

@connect(state => ({
  clusters: state.clusters
}), {clusterConfig})
export default class ClusterConfig extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    cluster: PropTypes.any,
    clusters: PropTypes.any,
    onHide: PropTypes.func.isRequired,

    clusterConfig: PropTypes.func
  };

  componentDidMount() {
    if (this.props && this.props.cluster) {
      this.props.clusterConfig(this.props.cluster);
    }
  }

  render() {
    return (
      <Dialog show
              hideCancel
              size="large"
              title={this.props.title}
              onSubmit={this.props.onHide}
              onHide={this.props.onHide}
      >
        <PropertyGrid data={this.props.clusters[this.props.cluster].configuration} />
      </Dialog>
    );
  }
}
