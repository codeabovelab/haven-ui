import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {clusterConfig} from 'redux/modules/clusters/clusters';
import {Dialog} from 'components';
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

  // TODO: Move to shared
  stringify(object) {
    let simpleObject = {};

    for (let prop in object) {
      if (!object.hasOwnProperty(prop)) {
        continue;
      }

      if (typeof(object[prop]) === 'object') {
        simpleObject[prop] = JSON.stringify(simpleObject);
        continue;
      }

      if (typeof(object[prop]) === 'function') {
        continue;
      }

      simpleObject[prop] = object[prop];
    }

    return JSON.stringify(simpleObject);
  }

  render() {
    console.log('redener', this.props);
    return (
      <Dialog show
              hideCancel
              size="large"
              title={this.props.title}
              onSubmit={this.props.onHide}
              onHide={this.props.onHide}
      >
        <form>
          <FormGroup>
            <FormControl componentClass="textarea"
                         value={this.stringify(this.props.clusters[this.props.cluster].configuration)}
                         rows={20}
                         readOnly
            />
          </FormGroup>
        </form>
      </Dialog>
    );
  }
}
