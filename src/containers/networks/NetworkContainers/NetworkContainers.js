import React, {Component, PropTypes} from 'react';
import * as clusterActions from 'redux/modules/clusters/clusters';
import * as containerActions from 'redux/modules/containers/containers';
import {connect} from 'react-redux';
import {PropertyGrid, LoadingDialog, ActionMenu, ContainerStatistics, EventLog} from '../../../components/index';
import {ContainerScale, ContainerUpdate} from '../../../containers/index';
import {Link} from 'react-router';
import {Button, ButtonToolbar, Badge, Panel, ProgressBar, Tabs, Tab} from 'react-bootstrap';
import _ from 'lodash';
import {browserHistory} from 'react-router';

@connect(state => ({
  clusters: state.clusters,
  containers: state.containers,
}), {
  loadContainers: clusterActions.loadContainers,
})
export default class NetworkContainers extends Component {
  static propTypes = {
    clusters: PropTypes.object.isRequired,
    containers: PropTypes.object,
    loadContainers: PropTypes.func.isRequired,
  };

  ACTIONS = [
    {
      key: "edit",
      title: "Edit",
      default: true
    },
    {
      key: "stats",
      title: "Stats"
    }
  ];

  render() {
    return (
      <div>
      </div>
    );
  }
}
