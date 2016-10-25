import React, {Component, PropTypes} from 'react';
import * as clusterActions from 'redux/modules/clusters/clusters';
import * as containerActions from 'redux/modules/containers/containers';
import {connect} from 'react-redux';
import { Link, browserHistory } from 'react-router';
import {ContainerLog, ContainerDetails, ContainerStatistics, DockTable, Chain, LoadingDialog, StatisticsPanel, ActionMenu} from '../../../components/index';
import {ContainerCreate, ContainerScale, ContainerUpdate} from '../../../containers/index';
import { asyncConnect } from 'redux-async-connect';
import {Dropdown, SplitButton, Button, ButtonToolbar, MenuItem, Panel, ProgressBar} from 'react-bootstrap';
import _ from 'lodash';

@connect(state => ({
  clusters: state.clusters,
  containers: state.containers.detailsByName,
  containersUI: state.containersUI
}), {
  loadContainers: clusterActions.loadContainers,
  startContainer: containerActions.start,
  stopContainer: containerActions.stop,
  loadDetailsByName: containerActions.loadDetailsByName,
  restartContainer: containerActions.restart,
  removeContainer: containerActions.remove})
export default class ContainerDetailed extends Component {
  static propTypes = {
    clusters: PropTypes.object.isRequired,
    containers: PropTypes.object,
    container: PropTypes.object,
    containersUI: PropTypes.object,
    params: PropTypes.object,
    loadDetailsByName: PropTypes.func.isRequired,
    startContainer: PropTypes.func.isRequired,
    stopContainer: PropTypes.func.isRequired,
    loadContainers: PropTypes.func.isRequired
  };

  componentWillMount() {
    require('bootstrap-switch/dist/js/bootstrap-switch.js');
    require('bootstrap-switch/dist/css/bootstrap3/bootstrap-switch.css');
    const {loadDetailsByName, params: {name}, params: {subname}} = this.props;
    loadDetailsByName(name, subname).then(()=> {
      initializeToggle();
      this.addToggleListener();
    });
  }

  addToggleListener() {
    const {startContainer, loadDetailsByName, stopContainer, params: {subname}, params: {name}, containers} = this.props;
    const container = containers[subname];
    const $toggleBox = $('#toggle-box');
    $toggleBox.on('switchChange.bootstrapSwitch', (event, state)=> {
      event.preventDefault();
      switch (state) {
        case true:
          this.processToggleResponse(startContainer, name, container, loadDetailsByName, $toggleBox);
          break;
        case false:
          this.processToggleResponse(stopContainer, name, container, loadDetailsByName, $toggleBox);
          break;
        default:
          break;
      }
    });
  }

  onHideDialog() {
    this.setState({
      actionDialog: undefined
    });
  }

  processToggleResponse(action, name, container, loadDetailsByName, $toggleBox) {
    const {startContainer} = this.props;
    let flag = action !== startContainer;
    action(container).then((response)=> {
      loadDetailsByName(name, container.name);
      if (response.code !== 200) {
        $toggleBox.bootstrapSwitch('state', flag, true);
      }
    }).catch((response)=> {
      loadDetailsByName(name, container.name);
      if (response.status !== 304) {
        $toggleBox.bootstrapSwitch('state', flag, true);
      }
    });
  }

  render() {
    const {containers, clusters, params: {name}, params: {subname}} = this.props;
    const container = containers ? containers[subname] : null;
    let containerHeaderBar = '';
    if (container) {
      containerHeaderBar = (
        <div className="clearfix">
          <h3>{container.name}</h3>
          <ButtonToolbar>
            <input type="checkbox"
                   name="my-checkbox"
                   id="toggle-box"
                   defaultChecked={container.run}
            />
          </ButtonToolbar>
        </div>
      );
    }

    if (!container) {
      return (
        <div><ProgressBar active now={100} /></div>
      );
    }

    return (
      <div>
        <ul className="breadcrumb">
          <li><a href="/clusters">Clusters</a></li>
          <li><a href={"/clusters" + "/" + name}>{name}</a></li>
          <li className="active">{subname}</li>
        </ul>
        <Panel header={containerHeaderBar}>
          {container.name}
        </Panel>

        {(this.state && this.state.actionDialog) && (
          <div>
            {this.state.actionDialog}
          </div>
        )}
      </div>
    );
  }

}

function initializeToggle() {
  $.fn.bootstrapSwitch.defaults.onColor = 'success';
  $.fn.bootstrapSwitch.defaults.onText = 'Running';
  $.fn.bootstrapSwitch.defaults.offText = 'Stopped';
  $("#toggle-box").bootstrapSwitch();
}
