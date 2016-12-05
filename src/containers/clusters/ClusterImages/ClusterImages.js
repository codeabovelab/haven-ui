import React, {Component, PropTypes} from 'react';
import * as clusterActions from 'redux/modules/clusters/clusters';
import * as containerActions from 'redux/modules/containers/containers';
import {connect} from 'react-redux';
import {ContainerLog, ContainerDetails, ContainerStatistics, DockTable, Chain, LoadingDialog, StatisticsPanel, ActionMenu, ClusterUploadCompose, ClusterSetSource} from '../../../components/index';
import { Link, browserHistory, Route, RouteHandler } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import {ContainerCreate, ContainerScale, ContainerUpdate} from '../../../containers/index';
import { asyncConnect } from 'redux-async-connect';
import {deleteClusterImages} from 'redux/modules/images/images';
import {Dropdown, SplitButton, Button, ButtonGroup, DropdownButton, ButtonToolbar, MenuItem, Panel, ProgressBar, Nav, NavItem, Image} from 'react-bootstrap';
import _ from 'lodash';
import {downloadFile} from '../../../utils/fileActions';

@connect(
  state => ({
    clusters: state.clusters,
    containers: state.containers,
    events: state.events,
    users: state.users
  }), {
    loadContainers: clusterActions.loadContainers,
    loadClusters: clusterActions.load,
    deleteCluster: clusterActions.deleteCluster,
    startContainer: containerActions.start,
    stopContainer: containerActions.stop,
    restartContainer: containerActions.restart,
    removeContainer: containerActions.remove,
    getClusterSource: clusterActions.getClusterSource,
    deleteClusterImages
  })
export default class ClusterImages extends Component {

  render() {
    return (
      <div>
        <ul className="breadcrumb">
          <li className="active">Agent</li>
        </ul>
        <div className="agentList">
          <p>ClusterImages
          </p>
        </div>
      </div>
    );
  }
}
