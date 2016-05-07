import React, {Component, PropTypes} from 'react';
import * as containerActions from 'redux/modules/containers/containers';
import {connect} from 'react-redux';
import _ from 'lodash';

@connect(
  state => ({
    containers: state.containers,
    containersUI: state.containersUI
  }),
  containerActions)
export default class ContainerLog extends Component {
  static propTypes = {
    containers: PropTypes.object,
    containersUI: PropTypes.object,
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
    const {container, containers, containersUI} = this.props;
    let containerDetailed = containers[container.id];
    let loadingLogs = _.get(containersUI, `[${container.id}].loadingLogs`, false);
    return (
      <div className={s.logs}>
        <h5>{container.name}</h5>
        {loadingLogs &&
        <pre className="text-xs-center">
          <i className="fa fa-spinner fa-5x fa-pulse"/>
        </pre>
        }
        {!loadingLogs &&
        <pre>{containerDetailed.logs}</pre>
        }
      </div>
    );
  }
}
