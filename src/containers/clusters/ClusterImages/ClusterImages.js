import React, {Component, PropTypes} from 'react';
import * as clusterActions from 'redux/modules/clusters/clusters';
import {connect} from 'react-redux';
import {ContainerLog, ContainerDetails, ContainerStatistics, DockTable, Chain, LoadingDialog, StatisticsPanel, ActionMenu, ClusterUploadCompose, ClusterSetSource} from '../../../components/index';
import { Link, browserHistory, Route, RouteHandler } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import {getDeployedImages} from 'redux/modules/images/images';
import {Dropdown, SplitButton, Button, ButtonGroup, DropdownButton, ButtonToolbar, MenuItem, Panel, ProgressBar, Nav, NavItem, Image, Popover} from 'react-bootstrap';
import _ from 'lodash';
import Select from 'react-select';

@connect(
  state => ({
    clusters: state.clusters,
    containers: state.containers,
    events: state.events,
    images: state.images
  }), {
    loadContainers: clusterActions.loadContainers,
    loadClusters: clusterActions.load,
    getDeployedImages
  })
export default class ClusterImages extends Component {
  static propTypes = {
    clusters: PropTypes.object,
    containers: PropTypes.object,
    events: PropTypes.object,
    images: PropTypes.object,
    params: PropTypes.object,
    getDeployedImages: PropTypes.func.isRequired,
    loadClusters: PropTypes.func.isRequired
  };

  COLUMNS = [
    {
      name: 'check',
      width: '1%',
      render: this.checkRender
    },

    {
      name: 'name',
      width: '10%'
    },

    {
      name: 'id',
      width: '15%'
    },

    {
      name: 'containersArr',
      render: this.containersRender,
      width: '20%'
    },

    {
      name: 'tags',
      render: this.tagsRender.bind(this),
      width: '10%'
    },

  ];

  componentWillMount() {
    const {getDeployedImages, params: {name}} = this.props;
    this.state = {
      tagsSelected: {}
    };
    getDeployedImages(name).then(() => {
      const {deployedImages} = this.props.images;
      const clustersImages = _.get(deployedImages, name, []);
      clustersImages.map(el => {
        if (el.id) {
          this.setState({
            tagsSelected: {
              ...this.state.tagsSelected,
              [el.id]: _.get(el, 'currentTag', '')
            }
          });
        }
      });
    });
  }

  containersRender(row) {
    let chainContainers = row.containers;
    let popoverRender = (el) => (
      <Popover>
        <span>Node: {shortenName(el.node) || ''}</span>
        <br></br>
        <span>Id: {shortenName(el.id) || ''}</span>
      </Popover>
    );

    return (
      <td key="containers">
        <Chain data={chainContainers}
               popoverPlacement="top"
               popoverRender={popoverRender}
               render={(container) => (<span title={String(container.name) || ""}>{String(container.name) || ""}</span>)}
        />
      </td>
    );
  }

  tagsRender(row) {
    let tagsOptions;
    const imageId = row.id;
    let currentTag = row.currentTag ? row.currentTag : '';
    tagsOptions = row.tags && row.tags.map(tag => {
      return {value: tag, label: tag};
    });
    tagsOptions.push({value: currentTag, label: currentTag});
    return (
      <td key="tags">
        <Select value={this.state.tagsSelected[imageId]}
                options={tagsOptions}
                placeholder = ""
                clearable={false}
                onChange={handleChange.bind(this, imageId)}
        />
      </td>
    );
    function handleChange(id, event) {
      let value = event.target ? event.target.value : event.value;
      this.setState({
        tagsSelected: {
          ...this.state.tagsSelected,
          [id]: value
        }
      });
    }
  }

  checkRender(row) {
    return (
      <td key="check">
        <div className="checkbox-button"><label>
          <input type="checkbox"
                 className="checkbox-control"
                 defaultChecked={false}
          />
          <span className="checkbox-label"><i className="fa fa-check-square fa-2x"></i></span>
        </label></div>
      </td>
    );
  }

  render() {
    require('react-select/dist/react-select.css');
    const {params: {name}, images} = this.props;

    let rows = _.get(this.props.images, `deployedImages.${name}`, []);
    return (
      <div key={name}>
        <ul className="breadcrumb">
          <li><Link to="/clusters">Clusters</Link></li>
          <li><Link to={"/clusters/" + name}>{name}</Link></li>
          <li className="active">Containers</li>
        </ul>
        <div className="panel panel-default">
          {(images.loadingDeployed && rows.length === 0) && (
            <ProgressBar active now={100}/>
          ) || (
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
                           searchable={false}
                />
              </div>
            </div>
          )}

          {(rows.length === 0 && !images.loadingDeployed) && (
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

function shortenName(name) {
  let result = String(name);
  const MAX_LENGTH = 25;
  if (name.length > MAX_LENGTH) {
    result = name.substr(0, MAX_LENGTH) + '...';
  }
  return result;
}
