import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {DockTable, Chain, StatisticsPanel} from '../../../components/index';
import {Link, RouteHandler} from 'react-router';
import {LinkContainer} from 'react-router-bootstrap';
import {getDeployedImages} from 'redux/modules/images/images';
import {updateContainers} from 'redux/modules/containers/containers';
import {FormGroup, InputGroup, FormControl, ControlLabel, Button, ProgressBar, Nav, NavItem, Popover, Modal} from 'react-bootstrap';
import _ from 'lodash';
import Select from 'react-select';

@connect(
  state => ({
    clusters: state.clusters,
    containers: state.containers,
    events: state.events,
    images: state.images
  }), {getDeployedImages, updateContainers})
export default class ClusterImages extends Component {
  static propTypes = {
    clusters: PropTypes.object,
    containers: PropTypes.object,
    events: PropTypes.object,
    images: PropTypes.object,
    params: PropTypes.object,
    getDeployedImages: PropTypes.func.isRequired,
    updateContainers: PropTypes.func.isRequired
  };

  COLUMNS = [
    {
      name: 'select',
      width: '1%',
      render: this.checkRender.bind(this)
    },

    {
      name: 'name',
      width: '24%'
    },

    {
      name: 'containers',
      render: this.containersRender,
      width: '30%'
    },

    {
      name: 'Current Tag',
      width: '15%',
      render: this.currentTagRender
    },

    {
      name: 'tags',
      render: this.tagsRender.bind(this),
      width: '30%'
    },

  ];

  UPDATE_STRATEGIES = [
    {
      value: "ui.updateContainers.stopThenStartEach",
      label: "Stop then start each"
    },
    {
      value: "ui.updateContainers.startThenStopEach",
      label: "Start then stop each"
    },
    {
      value: "ui.updateContainers.stopThenStartAll",
      label: "Stop then start all"
    }
  ];

  statisticsMetrics = [
    {
      type: 'number',
      title: 'Image Running',
      titles: 'Images Running'
    }
  ];

  componentWillMount() {
    const {getDeployedImages, params: {name}} = this.props;
    this.state = {
      tagsSelected: {},
      imagesToUpdate: {},
      showModal: false,
      updateStrategy: this.UPDATE_STRATEGIES[0].value,
      updatePercents: 100,
      updateResponse: '',
      schedule: '',
      jobTitle: ''
    };
    getDeployedImages(name).then(() => {
      const {deployedImages} = this.props.images;
      const clustersImages = _.get(deployedImages, name, []);
      clustersImages.map(el => {
        if (el.name) {
          let tags = _.get(el, 'tags', []);
          let lastTag = tags[tags.length - 1];
          this.setState({
            tagsSelected: {
              ...this.state.tagsSelected,
              [el.name]: lastTag
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

  currentTagRender(row) {
    let currentTag = _.get(row, 'currentTag', '');
    return (
      <td key="currentTag">
        <span>{currentTag}</span>
      </td>
    );
  }

  tagsRender(row) {
    let tagsOptions;
    const imageName = row.name;
    tagsOptions = row.tags && row.tags.map(tag => {
      return {value: tag, label: tag};
    });
    let disabled = !tagsOptions || tagsOptions.length === 0;
    return (
      <td key="tags" className="react-select-td" title={disabled ? "No tags available" : ""}>
        <Select value={this.state.tagsSelected[imageName]}
                options={tagsOptions}
                placeholder = ""
                disabled={disabled}
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

  closeModal() {
    this.setState({ showModal: false });
  }

  openModal() {
    this.setState({ showModal: true });
  }

  checkRender(row) {
    let iClassname = row.name ? "fa fa-check-square fa-2x" : "fa fa-exclamation-triangle fa-2x";
    return (
      <td key="select" className="checkbox-td">
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
      imagesToUpdate: $.extend(this.state.imagesToUpdate, {[name]: checked})
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

  onSubmit() {
    const {params: {name}, updateContainers} = this.props;
    let images = [];
    let imagesToUpdate = this.state.imagesToUpdate;
    let tags = this.state.tagsSelected;
    _.map(imagesToUpdate, (el, key) => {
      let updateTo = tags[key];
      if (key && el && updateTo) {
        images.push({name: key, to: updateTo});
      }
    });
    if (images.length > 0) {
      updateContainers(name, this.state.updateStrategy, this.state.updatePercents, this.state.schedule, this.state.jobTitle, images).then((response)=> {
        this.showResponse(response);
      }).catch((response) => {
        this.showResponse(response);
      });
    } else {
      this.setState({updateResponse: 'Select tags for chosen images to create update job.'});
      this.openModal();
    }
  }

  showResponse(response) {
    let message = 'Error';
    let status = '';
    console.log(response);
    status = response.code || response._res.status || response._res.code;
    if (status) {
      switch (status) {
        case 200:
          message = 'Update job successfully created';
          break;
        default:
          message = 'Failed to create update job: ' + response.message || response._res.message;
      }
    }
    this.setState({updateResponse: message});
    this.openModal();
  }

  render() {
    require('react-select/dist/react-select.css');
    const {params: {name}, images} = this.props;
    let rows = _.get(this.props.images, `deployedImages.${name}`, []);
    const imagesToUpdate = this.state.imagesToUpdate;
    let disabledUpdateButton = true;
    _.map(imagesToUpdate, (el, key) => {
      if (imagesToUpdate[key]) {
        disabledUpdateButton = false;
        return false;
      }
    });
    return (
      <div key={name}>
        <ul className="breadcrumb">
          <li><Link to="/clusters">Clusters</Link></li>
          <li><Link to={"/clusters/" + name}>{name}</Link></li>
          <li className="active">Images</li>
        </ul>
        {rows && (
          <StatisticsPanel metrics={this.statisticsMetrics}
                           values={[rows.length]}
          />
        )}
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
                  <NavItem eventKey={5} disabled={name === "all"}>Running Images</NavItem>
                </LinkContainer>
              </Nav>
              <div className="clusterImages">
                <form>
                  <div className="col-md-6">
                    <FormGroup>
                      <ControlLabel>Update Strategy</ControlLabel>
                      <FormControl componentClass="select" id="updateStrategy" value={this.state.updateStrategy}
                                   onChange={this.handleSelectChange.bind(this, 'updateStrategy')}>
                        {
                          this.UPDATE_STRATEGIES.map((el, i) => {
                            return <option key={i} value={el.value}>{el.label}</option>;
                          })
                        }
                      </FormControl>
                    </FormGroup>
                    <FormGroup>
                      <ControlLabel>Schedule</ControlLabel>
                      <FormControl type="text" onChange={this.handleSelectChange.bind(this, 'schedule')}
                                   placeholder="'0 0 * * * *' = the top of every hour of every day"/>
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
                    <div className="row">
                      <div className="col-md-6">
                        <FormGroup>
                          <ControlLabel>Job Title</ControlLabel>
                          <FormControl type="text" onChange={this.handleSelectChange.bind(this, 'jobTitle')}/>
                        </FormGroup>
                      </div>
                      <div className="col-md-6">
                        <FormGroup>
                          <Button bsStyle="primary" onClick={this.onSubmit.bind(this)}
                                  disabled={disabledUpdateButton}
                                  className="pulled-down-button pulled-right"
                                  title={disabledUpdateButton ? "Choose containers to update" : ""}>
                            <i className="fa fa-arrow-up"/>&nbsp;Update Containers
                          </Button>
                        </FormGroup>
                      </div>
                    </div>
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
        <Modal show={this.state.showModal} onHide={this.closeModal.bind(this)}>
          <Modal.Header closeButton>
            <Modal.Title>Update Info</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{this.state.updateResponse}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.closeModal.bind(this)}>Close</Button>
          </Modal.Footer>
        </Modal>
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
