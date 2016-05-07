import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {scale} from 'redux/modules/containers/containers';
import _ from 'lodash';

@connect(state => ({
  containersUI: state.containersUI
}), {scale})
export default class ContainerScale extends Component {
  static propTypes = {
    containersUI: PropTypes.object.isRequired,
    container: PropTypes.object.isRequired,
    scale: PropTypes.func.isRequired
  };
  static focusSelector = '#instances-number';

  componentDidMount() {
    this.refs.instances.value = 1;
  }

  render() {
    const {container, containersUI} = this.props;
    return (
      <div className="modal-content">
        <div className="modal-header">
          <button type="button" className="close" data-dismiss="modal">
            <span aria-hidden="true">&times;</span>
          </button>
          <h4 className="modal-title">Scale Container</h4>
        </div>
        <div className="modal-body">
          <div className="form-group" required>
            <label># of instances to be launched:</label>
            <input ref="instances" type="number" id={ContainerScale.focusSelector.replace('#', '')}
                   className="form-control"/>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={this.scale.bind(this)}
                  disabled={!_.get(this.refs, 'instances.value', '')}>
            Scale
          </button>
        </div>
      </div>
    );
  }

  scale() {
    const {container, scale} = this.props;

    return scale(container, this.refs.instances.value)
      .then(window.simpleModal.close)
      .catch();
  }
}
