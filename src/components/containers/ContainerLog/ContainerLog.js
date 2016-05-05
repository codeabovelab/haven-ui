import React, {Component, PropTypes} from 'react';
import * as containerActions from 'redux/modules/containers/containers';
import {connect} from 'react-redux';

@connect(
  state => ({
    containers: state.containers
  }),
  containerActions)
export default class ContainerLog extends Component {
  static propTypes = {
    containers: PropTypes.object,
    container: PropTypes.object.isRequired,
    loadLogs: PropTypes.func.isRequired
  };

  componentWillMount() {
    const {container, loadLogs} = this.props;
    loadLogs(container);
  }

  componentWillUpdate(nextProps) {
    const {container, loadLogs} = this.props;
    if (container.id !== nextProps.container.id) {
      loadLogs(nextProps.container);
    }
  }

  render() {
    const s = require('./ContainerLog.scss');
    const {container, containers} = this.props;
    let containerDetailed = containers[container.id];
    return (
      <div className={s.logs}>
        <h5>{container.name}</h5>
        <pre>{containerDetailed.logs}</pre>
      </div>
    );
  }
}
