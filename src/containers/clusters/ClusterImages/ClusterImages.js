import React, {Component, PropTypes} from 'react';
import * as clusterActions from 'redux/modules/clusters/clusters';
import {connect} from 'react-redux';
import {DockTable, Chain, LoadingDialog, StatisticsPanel} from '../../../components/index';
import {Link, RouteHandler} from 'react-router';
import {LinkContainer} from 'react-router-bootstrap';
import {getDeployedImages} from 'redux/modules/images/images';
import {FormGroup, InputGroup, FormControl, ControlLabel, Button, ProgressBar, Nav, NavItem, Popover} from 'react-bootstrap';
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
      render: this.checkRender.bind(this)
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

  UPDATE_STRATEGIES = ['ui.updateContainers.stopThenStartEach', 'ui.updateContainers.startThenStopEach', 'ui.updateContainers.stopThenStartAll'];

  componentWillMount() {
    const {getDeployedImages, params: {name}} = this.props;
    this.state = {
      tagsSelected: {},
      imagesToUpdate: {},
      updateStrategy: this.UPDATE_STRATEGIES[0],
      updatePercents: 100
    };
    getDeployedImages(name).then(() => {
      const {deployedImages} = this.props.images;
      const clustersImages = _.get(deployedImages, name, []);
      clustersImages.map(el => {
        if (el.name) {
          this.setState({
            tagsSelected: {
              ...this.state.tagsSelected,
              [el.name]: _.get(el, 'currentTag', '')
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
    const imageName = row.name;
    let currentTag = row.currentTag ? row.currentTag : '';
    tagsOptions = row.tags && row.tags.map(tag => {
      return {value: tag, label: tag};
    });
    tagsOptions.push({value: currentTag, label: currentTag});
    return (
      <td key="tags">
        <Select value={this.state.tagsSelected[imageName]}
                options={tagsOptions}
                placeholder = ""
                clearable={false}
                onChange={handleChange.bind(this, imageName)}
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
    console.log(row);
    let iClassname = row.name ? "fa fa-check-square fa-2x" : "fa fa-exclamation-triangle fa-2x";
    return (
      <td key="check">
        <div className="checkbox-button"><label>
          <input type="checkbox"
                 className="checkbox-control"
                 defaultChecked={false}
                 disabled={!row.name}
                 name={row.name}
                 onChange={this.toggleCheckbox.bind(this)}
          />
          <span title={row.name ? "" : "Can't be updated, image name is not available"} className="checkbox-label">
            <i className={iClassname}></i></span>
        </label></div>
      </td>
    );
  }

  toggleCheckbox(e) {
    let checked = e.target.checked;
    let name = e.target.name;
    this.setState({
      imagesToUpdate: $.extend(this.state.imagesToUpdate, {[name]: {checked: checked}})
    });
  }

  handleSelectChange(id, event) {
    let value = event.target ? event.target.value : event.value;
    if (id === 'updatePercents') {
      if (value > 100) {
        value = 100;
      }
      if (value < 0) {
        value = 10;
      }
    }
    this.setState({
      [id]: value
    });
  }

  render() {
    require('react-select/dist/react-select.css');
    const {params: {name}, images} = this.props;
    console.log('STATE: ', this.state);
    let rows = _.get(this.props.images, `deployedImages.${name}`, []);
    return (
      <div key={name}>
        <ul className="breadcrumb">
          <li><Link to="/clusters">Clusters</Link></li>
          <li><Link to={"/clusters/" + name}>{name}</Link></li>
          <li className="active">Images</li>
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
                <form>
                  <div className="col-md-6">
                    <FormGroup>
                      <ControlLabel>Select Update Strategy</ControlLabel>
                      <FormControl componentClass="select" id="updateStrategy" value={this.state.updateStrategy}
                                   onChange={this.handleSelectChange.bind(this, 'updateStrategy')}>
                        {
                          this.UPDATE_STRATEGIES.map((el, i) => {
                            return <option key={i} value={el}>{el}</option>;
                          })
                        }
                      </FormControl>
                    </FormGroup>
                  </div>
                  <div className="col-md-6">
                    <FormGroup>
                      <label>Percentage of affected containers:</label>
                      <InputGroup>
                        <FormControl type="number" step="10" max="100" min="10" id="updatePercents" value={this.state.updatePercents}
                                     onChange={this.handleSelectChange.bind(this, 'updatePercents')}/>
                        <InputGroup.Addon>%</InputGroup.Addon>
                      </InputGroup>
                    </FormGroup>
                    <FormGroup>
                      <Button bsStyle="primary" className="pulled-right">
                        <i className="fa fa-arrow-up"/>&nbsp;Update Selected Containers
                      </Button>
                    </FormGroup>
                  </div>
                </form>
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
