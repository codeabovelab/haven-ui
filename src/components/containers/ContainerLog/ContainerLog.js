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
    loadLogs({cluster: container.cluster, containerId: container.id});
  }

  render() {
    const s = require('./ContainerLog.scss');
    const {container, containers} = this.props;
    let containerDetailed = containers[container.id];
    return (
      <div>
        <h1 className="text-xs-center">{container.name}</h1>
        Log Container
        <div className={s.logs}>{containerDetailed.logs}</div>
      </div>
    );
  }
}
