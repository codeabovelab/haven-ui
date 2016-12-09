import React, {Component, PropTypes} from 'react';
import {Dialog} from 'components';
import {Row, Col, FormGroup, FormControl, Checkbox, ControlLabel, HelpBlock} from 'react-bootstrap';
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
    scale: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired
  };
  static focusSelector = '#instances-number';

  constructor(...params) {
    super(...params);
    this.state = {scaleFactor: 1};
  }

  onSubmit() {
    return this.props.scale(this.props.container, this.state.scaleFactor);
  }

  handleChange(e) {
    this.setState({scaleFactor: e.target.value});
  }

  render() {
    const {container, containersUI} = this.props;
    let scaling = _.get(containersUI, `[${container.id}].scaling`, false);

    return (
      <Dialog show
              size="large"
              title={`Scale Container: ${container.name}`}
              onSubmit={this.onSubmit.bind(this)}
              onHide={this.props.onHide}
              cancelTitle="Close"
      >
        {scaling && (
          <span>{' '}<i className="fa fa-spinner fa fa-pulse"/></span>
        )}

        <FormGroup onChange={this.handleChange.bind(this)}>
          <ControlLabel>Number of instances to be launched:</ControlLabel>
          <FormControl type="number" step="1" min="1" id={ContainerScale.focusSelector.replace('#', '')}
                       defaultValue={this.state.scaleFactor}
          />
        </FormGroup>
      </Dialog>
    );
  }

  scale() {
    const {container, scale} = this.props;

    return scale(container, this.state.scaleFactor)
      .then(this.props.onHide())
      .catch();
  }
}
