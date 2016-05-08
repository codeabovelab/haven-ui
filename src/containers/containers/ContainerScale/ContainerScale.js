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

  constructor(...params) {
    super(...params);
    this.state = {scaleFactor: 1};
  }

  handleChange(e) {
    this.setState({scaleFactor: e.target.value});
  }

  render() {
    const {container, containersUI} = this.props;
    let scaling = _.get(containersUI, `[${container.id}].scaling`, false);
    return (
      <div className="modal-content">
        <div className="modal-header">
          <button type="button" className="close" data-dismiss="modal">
            <span aria-hidden="true">&times;</span>
          </button>
          <h4 className="modal-title">Scale Container
            {scaling && <span>{' '}<i className="fa fa-spinner fa fa-pulse"/></span>}
          </h4>
        </div>
        <div className="modal-body">
          <div className="form-group" required>
            <label># of instances to be launched:</label>
            <input type="number" step="1" min="1" id={ContainerScale.focusSelector.replace('#', '')}
                   value={this.state.scaleFactor} onChange={this.handleChange.bind(this)}
                   className="form-control"/>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={this.scale.bind(this)}
                  disabled={!(this.state.scaleFactor > 0)}>
            Scale
          </button>
        </div>
      </div>
    );
  }

  scale() {
    const {container, scale} = this.props;

    return scale(container, this.state.scaleFactor)
      .then(window.simpleModal.close)
      .catch();
  }
}
