import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {clusterInformation} from 'redux/modules/clusters/clusters';
import {Dialog} from 'components';
import {FormGroup, FormControl, ControlLabel, HelpBlock} from 'react-bootstrap';

@connect(state => ({
  clusters: state.clusters
}), {clusterInformation})
export default class ClusterInformation extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    cluster: PropTypes.any,
    clusters: PropTypes.array,
    onHide: PropTypes.func.isRequired,

    clusterInformation: PropTypes.func
  };

  componentDidMount() {
    if (this.props && this.props.cluster) {
      this.props.clusterInformation(this.props.cluster);
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
        continue;
      }

      if (typeof(object[prop]) === 'function') {
        continue;
      }

      simpleObject[prop] = object[prop];
    }

    return JSON.stringify(simpleObject, null, '\t');
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
        Configuration props here
        <form>
          <FormGroup>
            <FormControl componentClass="textarea"
                         value={this.stringify(this.props.clusters[this.props.cluster].information)}
                         rows={20}
                         readOnly
            />
          </FormGroup>
        </form>
      </Dialog>
    );
  }
}
