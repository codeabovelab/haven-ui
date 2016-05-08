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
    containers: PropTypes.object.isRequired,
    containersUI: PropTypes.object.isRequired,
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
    const {container, containers, containersUI} = this.props;
    let containerDetailed = containers[container.id];
    let loadingLogs = _.get(containersUI, `[${container.id}].loadingLogs`, false);
    return (
      <div>
        <h5>{container.name}</h5>
        {loadingLogs &&
        <div className="text-xs-center">
          <i className="fa fa-spinner fa-5x fa-pulse"/>
        </div>
        }
        {!loadingLogs &&
        <div className="jumbotron-text">{containerDetailed.logs}</div>
        }
      </div>
    );
  }
}
