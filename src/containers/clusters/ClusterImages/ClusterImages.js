import React, {Component, PropTypes} from 'react';
import * as clusterActions from 'redux/modules/clusters/clusters';
import * as containerActions from 'redux/modules/containers/containers';
import {connect} from 'react-redux';
import {ContainerLog, ContainerDetails, ContainerStatistics, DockTable, Chain, LoadingDialog, StatisticsPanel, ActionMenu, ClusterUploadCompose, ClusterSetSource} from '../../../components/index';
import { Link, browserHistory, Route, RouteHandler } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import {ContainerCreate, ContainerScale, ContainerUpdate} from '../../../containers/index';
import { asyncConnect } from 'redux-async-connect';
import {getDeployedImages} from 'redux/modules/images/images';
import {Dropdown, SplitButton, Button, ButtonGroup, DropdownButton, ButtonToolbar, MenuItem, Panel, ProgressBar, Nav, NavItem, Image} from 'react-bootstrap';
import _ from 'lodash';
import {downloadFile} from '../../../utils/fileActions';

@connect(
  state => ({
    clusters: state.clusters,
    containers: state.containers,
    events: state.events,
    users: state.users,
    images: state.images
  }), {
    loadContainers: clusterActions.loadContainers,
    loadClusters: clusterActions.load,
    deleteCluster: clusterActions.deleteCluster,
    startContainer: containerActions.start,
    stopContainer: containerActions.stop,
    restartContainer: containerActions.restart,
    removeContainer: containerActions.remove,
    getClusterSource: clusterActions.getClusterSource,
    getDeployedImages
  })
export default class ClusterImages extends Component {
  static propTypes = {
    clusters: PropTypes.object,
    containers: PropTypes.object,
    events: PropTypes.object,
    images: PropTypes.object,
    params: PropTypes.object,
    loadContainers: PropTypes.func.isRequired,
    deleteCluster: PropTypes.func.isRequired,
    startContainer: PropTypes.func.isRequired,
    stopContainer: PropTypes.func.isRequired,
    restartContainer: PropTypes.func.isRequired,
    getDeployedImages: PropTypes.func.isRequired,
    removeContainer: PropTypes.func.isRequired,
    getClusterSource: PropTypes.func.isRequired,
    loadClusters: PropTypes.func.isRequired,
    deleteClusterImages: PropTypes.func.isRequired,
    users: PropTypes.object
  };

  COLUMNS = [
    {
      name: 'name',
    },

    {
      name: 'id',
    },

    {
      name: 'currentTag',
    }
  ];

  componentWillMount() {
    const {getDeployedImages, params: {name}} = this.props;

    getDeployedImages(name);
  }

  render() {
    console.log(this.props.images);
    const {params: {name}} = this.props;
    const rows = _.get(this.props.images, `deployedImages.${name}`, []);
    console.log(rows);
    return (
      <div key={name}>
        <ul className="breadcrumb">
          <li><Link to="/clusters">Clusters</Link></li>
          <li><Link to={"/clusters/" + name}>{name}</Link></li>
          <li className="active">Containers</li>
        </ul>
        <div className="panel panel-default">
          {!rows && (
            <ProgressBar active now={100}/>
          )}

          {rows && (
            <div>
              <Nav bsStyle="tabs" className="dockTable-nav">
                <LinkContainer to={"/clusters/" + name}>
                  <NavItem eventKey={1}>Containers</NavItem>
                </LinkContainer>
                <LinkContainer to={"/clusters/" + name + "/" + "applications"}>
                  <NavItem eventKey={2} disabled={name === "all"}>Applications</NavItem>
                </LinkContainer>
                <LinkContainer to={"/clusters/" + name + "/" + "nodes"}>
                  <NavItem eventKey={3}>Nodes</NavItem>
                </LinkContainer>
                <LinkContainer to={"/clusters/" + name + "/" + "events"}>
                  <NavItem eventKey={4}>Events</NavItem>
                </LinkContainer>
                <LinkContainer to={"/clusters/" + name + "/" + "registries"}>
                  <NavItem eventKey={5} disabled={name === "all"}>Registries</NavItem>
                </LinkContainer>
                <LinkContainer to={"/clusters/" + name + "/" + "images"}>
                  <NavItem eventKey={5} disabled={name === "all"}>Images</NavItem>
                </LinkContainer>
              </Nav>
              <div className="clusterImages">
                <DockTable columns={this.COLUMNS}
                           rows={rows}
                           key={name}
                />
              </div>
            </div>
          )}

          {(rows && rows.length === 0) && (
            <div className="alert alert-info">
              No images yet
            </div>
          )}
        </div>
        {(this.state && this.state.actionDialog) && (
          <div>
            {this.state.actionDialog}
          </div>
        )}
      </div>
    );
  }
}
